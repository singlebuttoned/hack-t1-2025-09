import { delay } from '@/constants/mock-api';
import { AreaGraph } from '@/features/overview/components/area-graph';

export default async function AreaStats() {
  await delay(1000);
  return <AreaGraph />;
}
