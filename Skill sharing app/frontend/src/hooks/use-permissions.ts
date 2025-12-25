import { useAuth } from './use-auth';

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    canCreateSkill: user?.role === 'teacher' || user?.role === 'both',
    canAcceptExchange: user?.role === 'teacher' || user?.role === 'both',
    canRate: user?.role === 'teacher' || user?.role === 'both',
    canModerateSkills: user?.role === 'teacher' || user?.role === 'both',
    isTeacher: user?.role === 'teacher' || user?.role === 'both',
    isLearner: user?.role === 'learner' || user?.role === 'both',
    userRole: user?.role,
  };
};
