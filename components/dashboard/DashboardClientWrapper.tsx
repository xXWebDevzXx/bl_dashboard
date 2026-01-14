interface Props {
  children: React.ReactNode;
}

export default function DashboardClientWrapper({ children }: Props) {
  return <>{children}</>;
}
