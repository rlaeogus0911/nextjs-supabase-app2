import { notFound } from "next/navigation";

import { EventForm } from "@/components/forms/event-form";
import { getMockEvents } from "@/lib/mock";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getMockEvents().find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">이벤트 수정</h1>
      <EventForm mode="edit" event={event} />
    </div>
  );
}
