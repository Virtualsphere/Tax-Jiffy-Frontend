export const ROUTES = {
  home: '/',
  auth: {
    root: '/auth',
    login: '/auth/login',
    signup: '/auth/signup',
  },
  notFound: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
