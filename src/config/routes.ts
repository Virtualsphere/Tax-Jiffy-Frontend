export const ROUTES = {
  home: '/',
  auth: {
    root: '/auth',
    login: '/auth/login',
    signup: '/auth/signup',
  },
  preview: '/preview',
  notFound: '*',
} as const;
