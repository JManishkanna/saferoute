export type User = { id: string; name: string; email: string; role: string }
export type Report = {
  id: string; title: string; description: string; category: string; severity: string;
  location: { x: number; y: number } | { coordinates: [number, number] };
  address?: string; status: string; createdAt: string; reportedBy?: string;
}
