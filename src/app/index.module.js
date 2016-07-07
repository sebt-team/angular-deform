/* global moment:false */

import { config } from './index.config';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { NavbarDirective } from './components/navbar/navbar.directive';

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
  .directive('acmeNavbar', NavbarDirective);

  //  DIRECTIVE -----------------------------------------------------
  import { BuilderProvider }                from './components/builder/builder.provider';
  import { FbFormObjectEditableController } from './components/builder/builder.controller';
  import { FbComponentsController }         from './components/builder/builder.controller';
  import { FbFormObjectController }         from './components/builder/builder.controller';
  import { FbBuilder }                      from './components/builder/builder.directive';
  import { FbBuilFbFormObjectEditableder }  from './components/builder/builder.directive';
  import { FbComponent }                    from './components/builder/builder.directive';
  import { FbForm }                         from './components/builder/builder.directive';
  import { FbFormObject }                   from './components/builder/builder.directive';

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
  .controller('fbFormObjectController', ['$scope', '$injector', FbFormObjectController])

  // -----------------------
  // DIRECTIVES
  // -----------------------
  angular.module('angularDeforms.directive', ['builder.provider', 'builder.controller', 'builder.drag', 'validator'])
  .directive('fbBuilder', ['$injector', FbBuilder])
  .directive('fbFormObjectEditable', ['$injector', FbFormObjectEditable])
  .directive('fbComponent', FbComponent)
  .directive('fbForm', ['$injector', FbForm])
  .directive('fbFormObject', ['$injector', FbFormObject])
