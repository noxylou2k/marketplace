import { BrowseShell } from "@/components/browse-shell"
import { CreateListingForm } from "@/components/create-listing-form"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function CreatePage() {
  return (
    <BrowseShell title="Create listing">
      <CreateListingForm localMode={!isSupabaseConfigured()} />
    </BrowseShell>
  )
}
