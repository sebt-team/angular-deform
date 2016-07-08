/* global moment:false */

import { config } from './index.config';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { NavbarDirective } from './components/navbar/navbar.directive';

angular
  .module('angularDeforms', ['ngAnimate', 'ngTouch', 'ngMessages', 'ngAria', 'toastr', 'builder', 'validator.rules'])

  // CONTANTS
  .constant('moment', moment)

  // CONFIG
  .config(config)

  // RUN
  .run(runBlock)

  // CONTROLLERS
  .controller('MainController', MainController)

  // DIRECTIVES
  .directive('acmeNavbar', NavbarDirective);

  //  DIRECTIVE -----------------------------------------------------
  import { BuilderProvider }                from './components/builder/builder.provider';
  import { DragProvider }                from './components/builder/builder.drag';
  import { FbFormObjectEditableController } from './components/builder/builder.controller';
  import { FbComponentsController }         from './components/builder/builder.controller';
  import { FbFormObjectController }         from './components/builder/builder.controller';
  import { FbBuilder }                      from './components/builder/builder.directive';
  // import { FbBuilFbFormObjectEditableder }  from './components/builder/builder.directive';
  // TODO: revisar que este export exista en el controller. Quiza se me paso.
  import { FbComponent }                    from './components/builder/builder.directive';
  import { FbForm }                         from './components/builder/builder.directive';
  import { FbFormObject }                   from './components/builder/builder.directive';
  import { FbComponentController }          from './components/builder/builder.directive';
  import { FbFormController }               from './components/builder/builder.directive';
  import { FbFormObjectEditable }           from './components/builder/builder.directive';

angular
  .module('builder', ['builderDirective'])

  // PROVIDERS
angular
  .module('builderProvider', [])
  .provider('$builder', BuilderProvider);

  // CONTROLLERS
angular
  .module('builderController', ['builderProvider'])
  .controller('fbFormObjectEditableController', ['$scope', '$injector', FbFormObjectEditableController])
  .controller('fbComponentsController', ['$scope', '$injector', FbComponentsController])
  .controller('fbFormObjectController', ['$scope', FbFormObjectController])
  .controller('fbComponentController', ['$scope', FbComponentController])
  .controller('fbFormController', ['$scope', '$injector', FbFormController]);

  // DIRECTIVES
angular
  .module('builderDirective', ['builderProvider', 'builderController', 'builderDrag', 'validator'])
  .directive('fbBuilder', ['$injector', FbBuilder])
  .directive('fbFormObjectEditable', ['$injector', FbFormObjectEditable])
  .directive('fbComponent', FbComponent)
  .directive('fbForm', ['$injector', FbForm])
  .directive('fbFormObject', ['$injector', FbFormObject]);

// DRAG
angular
  .module('builderDrag', [])
  .provider('$drag', DragProvider)
