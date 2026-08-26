import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin – Categories',
};

export default function AdminCategoriesPage() {
  return (
    <section className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>
      <p className="text-gray-600 mb-4">Select a category to edit its zones and services.</p>
      {/* Placeholder list – replace with real categories fetch */}
      <ul className="space-y-2">
        <li>
          <a
            href="/admin/categories/123/edit"
            className="text-blue-600 hover:underline"
          >
            Sample Category (ID: 123)
          </a>
        </li>
        <li>
          <a
            href="/admin/categories/456/edit"
            className="text-blue-600 hover:underline"
          >
            Another Category (ID: 456)
          </a>
        </li>
      </ul>
    </section>
  );
}
