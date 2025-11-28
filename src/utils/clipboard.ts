/**
 * Utilitário para copiar texto para o clipboard com fallback
 * Tenta usar a API moderna primeiro, depois usa o método legado
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Tentar usar a API moderna de clipboard (requer HTTPS ou localhost)
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback: usar o método legado com execCommand
    try {
      const input = document.createElement('input');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      input.style.top = '-9999px';
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, 99999); // Para mobile
      
      const success = document.execCommand('copy');
      document.body.removeChild(input);
      
      return success;
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err);
      return false;
    }
  }
}

/**
 * Versão alternativa que mostra o texto em um prompt se falhar
 */
export async function copyToClipboardWithPrompt(text: string, label: string = 'Texto'): Promise<boolean> {
  const success = await copyToClipboard(text);
  
  if (!success) {
    // Último fallback: mostrar em um alert para copiar manualmente
    alert(`${label}:\n\n${text}\n\nCopie manualmente (Ctrl+C ou Cmd+C)`);
    return false;
  }
  
  return true;
}
