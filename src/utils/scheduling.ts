/**
 * Gera os inícios dos horários de atendimento dentro de uma janela diária.
 *
 * O intervalo configurado é um tempo de preparação após cada serviço. Por
 * isso, ele faz parte tanto do espaço necessário para o horário caber no
 * expediente quanto do passo usado para chegar ao próximo horário.
 */
export function generateSlotStartMinutes(
  openMinutes: number,
  closeMinutes: number,
  serviceDuration: number,
  intervalMinutes: number,
): number[] {
  if (serviceDuration <= 0 || intervalMinutes < 0 || closeMinutes <= openMinutes) {
    return [];
  }

  const slotLength = serviceDuration + intervalMinutes;
  const starts: number[] = [];

  for (let current = openMinutes; current + slotLength <= closeMinutes; current += slotLength) {
    starts.push(current);
  }

  return starts;
}
