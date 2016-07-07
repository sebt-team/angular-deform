/* global moment:false */

import { config } from './index.config';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { NavbarDirective } from './components/navbar/navbar.directive';
import { BuilderProvider } from './components/builder/builder.provider';
import { fbFormObjectEditableController } from './components/builder/builder.controller';

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

  //  DIRECTIVE -----------------------------------------------------
  import { BuilderProvider }                from './components/builder/builder.provider';
  import { FbFormObjectEditableController } from './components/builder/builder.controller';
  import { FbComponentsController }         from './components/builder/builder.controller';
  import { fbFormObjectController }         from './components/builder/builder.controller';

  // -----------------------
  // PROVIDERS
  // -----------------------
  angular.module('builder.provider', [])
  .provider('$builder', BuilderProvider)

  // -----------------------
  // CONTROLLERS
  // -----------------------
  angular.module('builder.controller', ['builder.provider'])
  .controller('fbFormObjectEditableController', ['$scope', '$injector', fbFormObjectEditableController])
  .controller('fbComponentsController', ['$scope', '$injector', FbComponentsController])
  .controller('fbFormObjectController', ['$scope', '$injector', fbFormObjectController])
