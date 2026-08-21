"use client";

export default function WorkingStatusSelect({ id, defaultValue, action }: { id: string | number, defaultValue: string, action: any }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <select 
        name="working_status"
        defaultValue={defaultValue}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="border border-gray-300 rounded px-2 py-1 text-[11px] outline-none focus:border-blue-500 bg-white min-w-[80px]"
      >
        <option value="Complete">Complete</option>
        <option value="Reject">Reject</option>
        <option value="Pendi">Pendi</option>
      </select>
    </form>
  );
}
