import { ListingSkeleton } from '@/components/skeletons'

export default function Loading() {
  return <ListingSkeleton columns={2} cards={4} withSidebar />
}
