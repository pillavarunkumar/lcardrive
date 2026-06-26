import { redirect } from 'next/navigation';

export default function VehicleRedirect() {
  redirect('/portal/profile?tab=vehicle');
}
