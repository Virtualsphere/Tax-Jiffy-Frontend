export type DashboardStat = {
  label: string;
  value: string;
  emoji: string;
  /** CSS module class name for the icon color variant */
  colorClass: string;
};

export type DashboardQuickAction = {
  label: string;
  desc: string;
  path: string;
  emoji: string;
};

export type DashboardData = {
  stats: DashboardStat[];
  quickActions: DashboardQuickAction[];
  userName: string;
};
