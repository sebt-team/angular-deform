/* global moment:false */
import { config } from './index.config';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { NavbarDirective } from './components/navbar/navbar.directive';

angular
  .module('angularDeforms',
    [
      'ngAnimate',
      'ngTouch',
      'ngMessages',
      'ngAria',
      'toastr',
      'builder',
      'validator.rules',
      'builderComponents'
    ])

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
  import { DragProvider }                   from './components/builder/builder.drag';
  import { FbFormObjectEditableController } from './components/builder/builder.controller';
  import { FbBuilderController }            from './components/builder/builder.controller';
  import { FbComponentsController }         from './components/builder/builder.controller';
  import { FbComponentController }          from './components/builder/builder.controller';
  import { FbFormController }               from './components/builder/builder.controller';
  import { FbFormObjectController }         from './components/builder/builder.controller';
  import { DfDragpagesController }          from './components/builder/builder.controller';
  import { FbBuilder }                      from './components/builder/builder.directive';
  import { FbFormObjectEditable }           from './components/builder/builder.directive';
  import { FbObjectEditable }               from './components/builder/builder.directive';
  import { FbComponents }                   from './components/builder/builder.directive';
  import { FbComponent }                    from './components/builder/builder.directive';
  import { FbForm }                         from './components/builder/builder.directive';
  import { FbFormObject }                   from './components/builder/builder.directive';
  import { DfPageEditable }                 from './components/builder/builder.directive';
  import { DfDragpages }                    from './components/builder/builder.directive';
  import { Contenteditable }                from './components/builder/builder.directive';
  import { ComponentsBuilder }              from './components/builder/builder.components';

  // MAIN
angular
  .module('builder', ['builderDirective']);

  // PROVIDERS
angular
  .module('builderProvider', [])
  .provider('$builder', BuilderProvider);

  // CONFIG
angular
  .module('builderComponents', ['builder', 'validator.rules'])
  .config(['$builderProvider', ComponentsBuilder]);

  // CONTROLLERS
angular
  .module('builderController', ['builderProvider'])
  .controller('fbBuilderController', ['$scope', '$injector', FbBuilderController])
  .controller('fbFormObjectEditableController', ['$scope', '$injector', FbFormObjectEditableController])
  .controller('fbComponentsController', ['$scope', '$injector', FbComponentsController])
  .controller('fbFormObjectController', ['$scope', '$injector', FbFormObjectController])
  .controller('fbComponentController', ['$scope', '$injector', FbComponentController])
  .controller('fbFormController', ['$scope', '$injector', FbFormController])
  .controller('dfDragpagesController', ['$scope', DfDragpagesController]);

  // DRAG
angular
  .module('builderDrag', [])
  .provider('$drag', DragProvider);

  // DIRECTIVES
angular
  .module('builderDirective', ['builderProvider', 'builderController', 'builderDrag', 'validator'])
  .directive('fbBuilder', ['$injector', FbBuilder])
  .directive('fbFormObjectEditable', ['$injector', FbFormObjectEditable])
  .directive('fbObjectEditable', ['$injector', FbObjectEditable])
  .directive('fbComponent', ['$injector', FbComponent])
  .directive('fbComponents', FbComponents)
  .directive('fbForm', ['$injector', FbForm])
  .directive('fbFormObject', ['$injector', FbFormObject])
  .directive('dfPageEditable', ['$injector', DfPageEditable])
  .directive('dfDragpages', ['$injector', DfDragpages])
  .directive('contenteditable', ['$injector', Contenteditable]);
