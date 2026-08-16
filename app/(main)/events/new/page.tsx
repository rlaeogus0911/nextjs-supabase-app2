import { EventForm } from "@/components/forms/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">이벤트 생성</h1>
      <EventForm mode="create" />
    </div>
  );
}
