import pool from "../../../../lib/db";
import AddRateCardForm from "./AddRateCardForm";

export const dynamic = 'force-dynamic';

export default async function NewRateCardPage() {
  let categories = [];
  let rateHeadings = [];

  try {
    const [catRows]: any = await pool.query("SELECT id, title FROM categories ORDER BY id ASC");
    categories = catRows;

    const [headingRows]: any = await pool.query("SELECT id, title FROM rate_headings ORDER BY id ASC");
    rateHeadings = headingRows;
  } catch (error) {
    console.error("Error fetching data for rate card form:", error);
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-[#1f2937] px-6 py-4">
            <h1 className="text-white font-medium text-[15px] text-center">Add Rate Card</h1>
          </div>

          <AddRateCardForm categories={categories} rateHeadings={rateHeadings} />
        </div>
      </div>
    </div>
  );
}
