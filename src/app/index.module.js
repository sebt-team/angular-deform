/*eslint angular/di: [2,"array"]*/

import { BuilderProvider }                from './components/builder/builder.provider';
import { DragProvider }                   from './components/builder/builder.drag';
import { DfFormObjectEditableController } from './components/builder/builder.controller';
import { DfBuilderController }            from './components/builder/builder.controller';
import { DfComponentsController }         from './components/builder/builder.controller';
import { DfComponentController }          from './components/builder/builder.controller';
import { DfFormController }               from './components/builder/builder.controller';
import { DfFormObjectController }         from './components/builder/builder.controller';
import { DfDragpagesController }          from './components/builder/builder.controller';
import { DfBuilder }                      from './components/builder/builder.directive';
import { DfFormObjectEditable }           from './components/builder/builder.directive';
import { DfObjectEditable }               from './components/builder/builder.directive';
import { DfComponents }                   from './components/builder/builder.directive';
import { DfComponent }                    from './components/builder/builder.directive';
import { DfForm }                         from './components/builder/builder.directive';
import { DfFormObject }                   from './components/builder/builder.directive';
import { DfPageEditable }                 from './components/builder/builder.directive';
import { DfFormBuilder }                    from './components/builder/builder.directive';
import { Contenteditable }                from './components/builder/builder.directive';
import { ConfigBuilder }                  from './components/builder/builder.config';

// MAIN
angular
  .module('angularDeforms',
    [
      'ngAnimate',
      'validator.rules',
      'builderDirective',
      'builderComponents',
      'builderProvider'
    ]);

// DIRECTIVE
angular
  .module('builder', ['builderDirective']);

// PROVIDERS
angular
  .module('builderProvider', [])
  .provider('$builder', [BuilderProvider]);

// CONFIG
angular
  .module('builderComponents', ['builder', 'validator.rules'])
  .config(['$logProvider', '$builderProvider', ConfigBuilder]);

// CONTROLLERS
angular
  .module('builderController', ['builderProvider'])
  .controller('dfBuilderController', [DfBuilderController])
  .controller('dfFormObjectEditableController', ['$scope', '$injector', '$log', DfFormObjectEditableController])
  .controller('dfComponentsController', ['$scope', '$injector', DfComponentsController])
  .controller('dfFormObjectController', ['$scope', '$injector', DfFormObjectController])
  .controller('dfComponentController', ['$scope', '$injector', DfComponentController])
  .controller('dfFormController', ['$scope', '$injector', DfFormController])
  .controller('dfDragpagesController', [DfDragpagesController]);

// DRAG
angular
  .module('builderDrag', [])
  .provider('$drag', [DragProvider]);

// DIRECTIVES
angular
  .module('builderDirective', ['builderProvider', 'builderController', 'builderDrag', 'validator'])
  .directive('dfBuilder', ['$injector', DfBuilder])
  .directive('dfFormObjectEditable', ['$injector', DfFormObjectEditable])
  .directive('dfObjectEditable', ['$injector', DfObjectEditable])
  .directive('dfComponent', ['$injector', DfComponent])
  .directive('dfComponents', [DfComponents])
  .directive('dfForm', ['$injector', DfForm])
  .directive('dfFormObject', ['$injector', DfFormObject])
  .directive('dfPageEditable', ['$injector', DfPageEditable])
  .directive('dfFormBuilder', ['$injector', DfFormBuilder])
  .directive('contenteditable', ['$injector', Contenteditable]);
