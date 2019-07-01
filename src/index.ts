export { register } from './loader';

if (module.parent && module.parent.id === 'internal/preload') {
  require('../register');
}
