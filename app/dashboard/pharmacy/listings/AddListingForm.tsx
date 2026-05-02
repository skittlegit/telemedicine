"use client";

import { useActionState, useRef, useEffect } from "react";
import { addListingAction } from "@/app/actions/pharmacy";

type State = { error?: string; ok?: boolean };
const initial: State = {};

export function AddListingForm() {
  const [state, action, pending] = useActionState(addListingAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && formRef.current) formRef.current.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid grid-cols-12 gap-3 border border-[color:var(--rule)] p-4"
    >
      <div className="col-span-12 md:col-span-4">
        <label className="eyebrow block mb-1.5" htmlFor="ml-name">
          Name
        </label>
        <input
          id="ml-name"
          name="name"
          required
          className="field"
          placeholder="Paracetamol 500mg"
        />
      </div>
      <div className="col-span-12 md:col-span-3">
        <label className="eyebrow block mb-1.5" htmlFor="ml-generic">
          Generic
        </label>
        <input
          id="ml-generic"
          name="generic"
          className="field"
          placeholder="acetaminophen"
        />
      </div>
      <div className="col-span-6 md:col-span-2">
        <label className="eyebrow block mb-1.5" htmlFor="ml-cat">
          Category
        </label>
        <select id="ml-cat" name="category" defaultValue="otc" className="field">
          <option value="otc">OTC</option>
          <option value="rx">Prescription</option>
          <option value="wellness">Wellness</option>
          <option value="devices">Devices</option>
          <option value="first-aid">First aid</option>
          <option value="cold-chain">Cold chain</option>
        </select>
      </div>
      <div className="col-span-3 md:col-span-1">
        <label className="eyebrow block mb-1.5" htmlFor="ml-price">
          Price ₹
        </label>
        <input
          id="ml-price"
          name="priceRupees"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue="0"
          className="field tabular"
        />
      </div>
      <div className="col-span-3 md:col-span-1">
        <label className="eyebrow block mb-1.5" htmlFor="ml-stock">
          Stock
        </label>
        <input
          id="ml-stock"
          name="stock"
          type="number"
          min="0"
          required
          defaultValue="0"
          className="field tabular"
        />
      </div>
      <div className="col-span-12 md:col-span-1 flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-clay btn-sm w-full justify-center"
        >
          {pending ? "Adding…" : "Add →"}
        </button>
      </div>

      {state.error && (
        <div
          role="alert"
          className="alert-band col-span-12"
          data-tone="oxblood"
        >
          <span>{state.error}</span>
        </div>
      )}
      {state.ok && (
        <div
          role="status"
          className="alert-band col-span-12"
          data-tone="moss"
        >
          <span>Listing added.</span>
        </div>
      )}
    </form>
  );
}
