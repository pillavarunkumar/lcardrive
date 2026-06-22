import { Metadata } from 'next';
import InstructorProfileClient from './InstructorProfileClient';
import { supabase } from '@/lib/supabase';
import type { Instructor, Review } from '@/types';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { suburb: string; slug: string } }): Promise<Metadata> {
  const name = params.slug.split('-').slice(0, 2).join(' ');
  const suburb = params.suburb.replace(/-/g, ' ');
  return {
    title: `${name} — Driving Instructor in ${suburb} | LCarDrive`,
    description: `${name} is a driving instructor in ${suburb}. View rates, reviews, and availability.`,
    openGraph: { title: `${name} — Driving Instructor in ${suburb}`, description: `Find ${name}, a qualified driving instructor serving ${suburb} and surrounding areas.` },
  };
}

export default async function InstructorProfilePage({ params }: { params: { suburb: string; slug: string } }) {
  if (!supabase) {
    return <InstructorProfileClient instructor={null} reviews={[]} />;
  }

  const { data: instructor } = await supabase
    .from('instructors')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!instructor) {
    notFound();
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('instructor_id', instructor.id)
    .order('created_at', { ascending: false });

  return (
    <InstructorProfileClient
      instructor={instructor as Instructor}
      reviews={(reviews || []) as Review[]}
    />
  );
}
