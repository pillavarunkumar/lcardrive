import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { computeVerification } from '@/lib/verification';
import type { ProfileFormState } from '@/lib/verification';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data: instructor, error: fetchError } = await supabase
    .from('instructors')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (fetchError || !instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  const formState: ProfileFormState = {
    firstName: instructor.first_name || '',
    lastName: instructor.last_name || '',
    verifiedName: instructor.verified_name || null,
    profilePhotoUrl: instructor.profile_photo_url || null,
    bio: instructor.bio || '',
    driversLicenceNumber: instructor.drivers_licence_number || '',
    driversLicenceImageUrl: instructor.drivers_licence_image_url || null,
    adiRegNumber: instructor.adi_registration || '',
    adiRegImageUrl: instructor.adi_registration_image_url || null,
    certIVReference: instructor.certificate_iv_reference || '',
    certIVImageUrl: instructor.certificate_iv_image_url || null,
    wwccNumber: instructor.wwcc_number || '',
    wwccImageUrl: instructor.wwcc_image_url || null,
    policeCheckDate: instructor.police_check_date || '',
    policeCheckImageUrl: instructor.police_check_image_url || null,
    medAssessmentDate: instructor.medical_assessment_date || '',
    medAssessmentImageUrl: instructor.medical_assessment_image_url || null,
    pubLiabProvider: instructor.public_liability_provider || '',
    pubLiabExpiry: instructor.public_liability_expiry || '',
    pubLiabImageUrl: instructor.public_liability_image_url || null,
    vehicleMake: instructor.vehicle_make || '',
    vehicleModel: instructor.vehicle_model || '',
    vehicleRego: instructor.vehicle_rego || '',
    vehicleColor: instructor.vehicle_color || '',
    vehicleImageUrl: instructor.vehicle_image_url || null,
  };

  const verification = computeVerification(formState);

  if (!verification.identityVerified) {
    return NextResponse.json({ error: 'Identity information is incomplete' }, { status: 400 });
  }

  if (!verification.documentsSubmitted) {
    return NextResponse.json({ error: 'Not all required documents have been uploaded' }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('instructors')
    .update({
      is_verified: true,
      identity_verified_at: now,
      documents_submitted_at: now,
    })
    .eq('clerk_user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ verified: true, verified_at: now });
}
