import { notFound, redirect } from "next/navigation";

import { EventForm } from "@/components/forms/event-form";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/api/events";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const currentUserId = data?.claims.sub;

  const event = await getEventById(supabase, id);

  if (!event) {
    notFound();
  }

  if (event.createdBy !== currentUserId) {
    redirect(`/events/${event.id}`);
  }

  return (
    <div className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">이벤트 수정</h1>
      <EventForm mode="edit" event={event} />
    </div>
  );
}
