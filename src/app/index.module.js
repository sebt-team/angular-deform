/* global moment:false */

import { config } from './index.config';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { NavbarDirective } from './components/navbar/navbar.directive';
import { BuilderProvider } from './components/builder/builder.provider';

angular.module('angularDeforms', ['ngAnimate', 'ngTouch', 'ngMessages', 'ngAria', 'toastr'])

	// -----------------------
	// CONTANTS
	// -----------------------
  .constant('moment', moment)

	// -----------------------
	// CONFIG
	// -----------------------
  .config(config)

	// -----------------------
	// RUN
	// -----------------------
  .run(runBlock)

	// -----------------------
	// CONTROLLERS
	// -----------------------
  .controller('MainController', MainController)

	// -----------------------
	// DIRECTIVES
	// -----------------------
  .directive('acmeNavbar', NavbarDirective)

	// -----------------------
	// PROVIDERS
	// -----------------------
  .provider('$builder', BuilderProvider)
