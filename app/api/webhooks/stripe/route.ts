import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { Payment } from "@/lib/models/Payment";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const body = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "invalid signature" },
      { status: 400 },
    );
  }

  await connectDB();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as {
          id: string;
          payment_intent: string | null;
          metadata: Record<string, string> | null;
        };
        const meta = sess.metadata ?? {};
        await Payment.findOneAndUpdate(
          { stripeSessionId: sess.id },
          {
            status: "succeeded",
            stripePaymentIntentId: sess.payment_intent ?? undefined,
          },
        );

        if (meta.kind === "consultation" && meta.appointmentId) {
          await Appointment.findByIdAndUpdate(meta.appointmentId, {
            status: "scheduled",
            paymentIntentId: sess.payment_intent ?? undefined,
          });
          await audit({
            actorRole: "system:stripe-webhook",
            action: "payment.consultation.succeeded",
            target: `Appointment:${meta.appointmentId}`,
          });
        } else if (meta.kind === "pharmacy" && meta.orderId) {
          await PharmacyOrder.findByIdAndUpdate(meta.orderId, {
            paidAt: new Date(),
            paymentIntentId: sess.payment_intent ?? undefined,
          });
          await audit({
            actorRole: "system:stripe-webhook",
            action: "payment.pharmacy.succeeded",
            target: `PharmacyOrder:${meta.orderId}`,
          });
        }
        break;
      }
      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const obj = event.data.object as { id: string };
        await Payment.findOneAndUpdate(
          { $or: [{ stripeSessionId: obj.id }, { stripePaymentIntentId: obj.id }] },
          { status: "failed", failureMessage: event.type },
        );
        break;
      }
      default:
        // ignore other events
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return NextResponse.json({ error: "handler" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
