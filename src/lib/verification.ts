export interface VerificationCheck {
  label: string;
  passed: boolean;
  section: 'identity' | 'documents' | 'profile' | 'name';
}

export interface VerificationResult {
  identityVerified: boolean;
  documentsSubmitted: boolean;
  fullyVerified: boolean;
  checks: VerificationCheck[];
}

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  verifiedName: string | null;
  profilePhotoUrl: string | null;
  bio: string;

  driversLicenceNumber: string;
  driversLicenceImageUrl: string | null;

  adiRegNumber: string;
  adiRegImageUrl: string | null;

  certIVReference: string;
  certIVImageUrl: string | null;

  wwccNumber: string;
  wwccImageUrl: string | null;

  policeCheckDate: string;
  policeCheckImageUrl: string | null;

  medAssessmentDate: string;
  medAssessmentImageUrl: string | null;

  pubLiabProvider: string;
  pubLiabExpiry: string;
  pubLiabImageUrl: string | null;

  vehicleMake: string;
  vehicleModel: string;
  vehicleRego: string;
  vehicleColor: string;
  vehicleImageUrl: string | null;
}

export function computeVerification(state: ProfileFormState): VerificationResult {
  const checks: VerificationCheck[] = [];

  const profilePhotoOk = !!state.profilePhotoUrl;
  checks.push({ label: 'Profile photo uploaded', passed: profilePhotoOk, section: 'identity' });

  const nameOk = !!state.firstName && !!state.lastName;
  checks.push({ label: 'Name filled in', passed: nameOk, section: 'identity' });

  const nameVerified = !!state.verifiedName;
  checks.push({ label: 'Name verified via document upload', passed: nameVerified, section: 'name' });

  const licenceNumberOk = !!state.driversLicenceNumber;
  const licenceImageOk = !!state.driversLicenceImageUrl;
  checks.push({ label: 'Driver\'s licence entered', passed: licenceNumberOk, section: 'identity' });
  checks.push({ label: 'Driver\'s licence image uploaded', passed: licenceImageOk, section: 'documents' });

  const adiNumberOk = !!state.adiRegNumber;
  const adiImageOk = !!state.adiRegImageUrl;
  checks.push({ label: 'ADI registration entered', passed: adiNumberOk, section: 'identity' });
  checks.push({ label: 'ADI registration image uploaded', passed: adiImageOk, section: 'documents' });

  const certIVEntered = !!state.certIVReference;
  const certIVImageOk = !!state.certIVImageUrl;
  checks.push({ label: 'Certificate IV entered', passed: certIVEntered, section: 'documents' });
  checks.push({ label: 'Certificate IV image uploaded', passed: certIVImageOk, section: 'documents' });

  const wwccEntered = !!state.wwccNumber;
  const wwccImageOk = !!state.wwccImageUrl;
  checks.push({ label: 'WWCC entered', passed: wwccEntered, section: 'documents' });
  checks.push({ label: 'WWCC image uploaded', passed: wwccImageOk, section: 'documents' });

  const policeEntered = !!state.policeCheckDate;
  const policeImageOk = !!state.policeCheckImageUrl;
  checks.push({ label: 'Police check entered', passed: policeEntered, section: 'documents' });
  checks.push({ label: 'Police check image uploaded', passed: policeImageOk, section: 'documents' });

  const medEntered = !!state.medAssessmentDate;
  const medImageOk = !!state.medAssessmentImageUrl;
  checks.push({ label: 'Medical assessment entered', passed: medEntered, section: 'documents' });
  checks.push({ label: 'Medical assessment image uploaded', passed: medImageOk, section: 'documents' });

  const liabEntered = !!state.pubLiabProvider && !!state.pubLiabExpiry;
  const liabImageOk = !!state.pubLiabImageUrl;
  checks.push({ label: 'Insurance entered', passed: liabEntered, section: 'documents' });
  checks.push({ label: 'Insurance image uploaded', passed: liabImageOk, section: 'documents' });

  const identityChecks = checks.filter(c => c.section === 'identity');
  const documentChecks = checks.filter(c => c.section === 'documents');

  const identityVerified = identityChecks.every(c => c.passed);
  const documentsSubmitted = documentChecks.filter(c => c.label.includes('image')).every(c => c.passed);
  const fullyVerified = identityVerified && documentsSubmitted;

  return { identityVerified, documentsSubmitted, fullyVerified, checks };
}
