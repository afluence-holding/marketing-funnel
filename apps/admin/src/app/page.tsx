import { redirect } from 'next/navigation';

// Landing redirect — in Fase 1 there's a single BU (german-roz/di21).
// Fase 2 will show an organizer/BU picker.
export default function Home() {
  redirect('/german-roz/di21');
}
