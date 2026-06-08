import { Metadata } from 'next';
import InstructorProfileClient from './InstructorProfileClient';

export async function generateMetadata({ params }: { params: { suburb: string; slug: string } }): Promise<Metadata> {
  const name = params.slug.split('-').slice(0, 2).join(' ');
  const suburb = params.suburb.replace(/-/g, ' ');
  return {
    title: `${name} — Driving Instructor in ${suburb} | LCarDrive`,
    description: `${name} is a driving instructor in ${suburb}. View rates, reviews, and availability.`,
    openGraph: { title: `${name} — Driving Instructor in ${suburb}`, description: `Find ${name}, a qualified driving instructor serving ${suburb} and surrounding areas.` },
  };
}

export default function InstructorProfilePage() {
  return <InstructorProfileClient />;
}
