
export const revokeAccess = async (refreshToken: string) => {
  const revokeResponse = await fetch(
    `https://oauth2.googleapis.com/revoke?token=${refreshToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  if (!revokeResponse.ok) {
    console.error('Failed to revoke token:', await revokeResponse.text());
  }

  return { success: true };
};
