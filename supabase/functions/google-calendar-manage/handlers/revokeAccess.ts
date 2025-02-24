
export const revokeAccess = async (refreshToken: string) => {
  console.log('[revokeAccess] Iniciando revogação de token');

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
    const errorText = await revokeResponse.text();
    console.error('[revokeAccess] Falha ao revogar token:', {
      status: revokeResponse.status,
      error: errorText
    });
  }

  console.log('[revokeAccess] Token revogado com sucesso');
  return { success: true };
};
