/* global moment:false */

import { config } from './index.config';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { NavbarDirective } from '../app/components/navbar/navbar.directive';

angular.module('angularDeforms', ['ngAnimate', 'ngTouch', 'ngMessages', 'ngAria', 'toastr'])
  .constant('moment', moment)
  .config(config)
  .run(runBlock)
  .controller('MainController', MainController)
  .directive('acmeNavbar', NavbarDirective)
