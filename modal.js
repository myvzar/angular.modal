(function(){
	"use strict";

	angular
		.module('modal',[])
		.factory('Modal',['$q', '$http', '$templateCache', '$rootScope', '$controller', '$compile', '$animate', modalFactory])
	;

	function modalFactory($q,$http,$templateCache,$rootScope,$controller,$compile,$animate)
	{

		var options = {
			controller        : null,
			controllerAs      : 'modal',
			templateFolders   : '/views/',
			resolve           : {},
			useTemplateFolder : true
		};

		function modal(params)
		{
			if(typeof this != 'object') {
				angular.extend(options,params);
			} else {
				var $this = this;

				$this.modalParams = {};
				$this.modalParams = angular.extend({},options,params);

				if(!(!$this.modalParams.template ^ !$this.modalParams.templateUrl)) {
					throw new Error('What i can use??? none or both template chosen!');
				}

				var html,element,scope,container = angular.element(document.body);

				if($this.modalParams.template) {
					html = $q.when($this.modalParams.template)
				} else {
					var Template = ($this.modalParams.useTemplateFolder) ?
						$this.modalParams.templateFolders + $this.modalParams.templateUrl:
						$this.modalParams.templateUrl
					;
					html = $http.get(Template, {
						cache: $templateCache
					}).then(function (response) {
						return response.data;
					});
				}

				$this.opened = false;

				$this.open   = function(variables){
					return html.then(function(html) {
						if(!element){
							element = angular.element(html);
							if(element.length === 0) { throw new Error('Template is empty!!!') }
							scope = $rootScope.$new();
							if(variables){
								for(var v in variables) {
									if(variables.hasOwnProperty(v)) scope[v] = variables[v];
								}
							}
							scope.closeModal = $this.close;
							var Controller = $controller($this.modalParams.controller, {$scope:scope});
							if($this.modalParams.controllerAs) {
								scope[$this.modalParams.controllerAs] = Controller;
							}
							$compile(element)(scope);
							$this.opened = true;
							return $animate.enter(element, container);
						}
					});
				};

				$this.close = function(response){
					if(!element) return $q.when();
					return $animate.leave(element).then(function(){
						scope.$destroy(); scope   = null;
						element.remove(); element = null;
						$this.opened = false;
						if(typeof $this.modalParams.onRelease == "function") {
							$this.modalParams.onRelease(response);
						}
					});
				};
			}
		}
		return modal;
	}
})();