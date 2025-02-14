import { LuigiClientBase } from './baseClass';
import { helpers } from './helpers';
import { splitViewHandle } from './splitViewHandle';

/**
 * The Link Manager allows you to navigate to another route. Use it instead of an internal router to:
  - Provide routing inside micro frontends.
  - Reflect the route.
  - Keep the navigation state in Luigi.
  * @name linkManager
  */
export class linkManager extends LuigiClientBase {
  /**
   * @private
   */
  constructor(values) {
    super();
    Object.assign(this, values);

    this.options = {
      preserveView: false,
      nodeParams: {},
      errorSkipNavigation: false,
      fromContext: null,
      fromClosestContext: false,
      fromVirtualTreeRoot: false,
      fromParent: false,
      relative: false,
      link: ''
    };
  }

  /**
   * Navigates to the given path in the application hosted by Luigi. It contains either a full absolute path or a relative path without a leading slash that uses the active route as a base. This is the standard navigation.
   * @memberof linkManager
   * @param {string} path path to be navigated to
   * @param {string} sessionId current Luigi **sessionId**
   * @param {boolean} preserveView preserve a view by setting it to `true`. It keeps the current view opened in the background and opens the new route in a new frame. Use the {@link #goBack goBack()} function to navigate back. You can use this feature across different levels. Preserved views are discarded as soon as you use the standard {@link #navigate navigate()} function instead of {@link #goBack goBack()}
   * @param {Object} modalSettings opens a view in a modal. Use these settings to configure the modal's title and size
   * @param {string} modalSettings.title modal title. By default, it is the node label. If there is no label, it is left empty
   * @param {('l'|'m'|'s')} [modalSettings.size="l"] size of the modal
   * @param {Object} splitViewSettings opens a view in a split view. Use these settings to configure the split view's behaviour
   * @param {string} splitViewSettings.title split view title. By default, it is the node label. If there is no label, it is left empty
   * @param {number} [splitViewSettings.size=40] height of the split view in percent
   * @param {boolean} [splitViewSettings.collapsed=false] creates split view but leaves it closed initially
   * @param {Object} drawerSettings opens a view in a drawer. Use these settings to configure if the drawer has a header, backdrop and size.
   * @param {any} drawerSettings.header By default, the header is visible. The default title is the node label, but the header could also be an object with a `title` attribute allowing you to specify your own title.  An 'x' icon is displayed to close the drawer view.
   * @param {boolean} drawerSettings.backdrop By default, it is set to `false`. If it is set to `true` the rest of the screen has a backdrop.
   * @param {('l'|'m'|'s'|'xs')} [drawerSettings.size="s"] size of the drawer
   * @example
   * LuigiClient.linkManager().navigate('/overview')
   * LuigiClient.linkManager().navigate('users/groups/stakeholders')
   * LuigiClient.linkManager().navigate('/settings', null, true) // preserve view
   * LuigiClient.linkManager().navigate('#?Intent=Sales-order?id=13') // intent navigation
   */
  navigate(path, sessionId, preserveView, modalSettings, splitViewSettings, drawerSettings) {
    if (this.options.errorSkipNavigation) {
      this.options.errorSkipNavigation = false;
      return;
    }
    if (modalSettings && splitViewSettings && drawerSettings) {
      console.warn(
        'modalSettings, splitViewSettings and drawerSettings cannot be used together. Only modal setting will be taken into account.'
      );
    }

    this.options.preserveView = preserveView;
    const relativePath = path[0] !== '/';
    const hasIntent = path.toLowerCase().includes('?intent=');
    const navigationOpenMsg = {
      msg: 'luigi.navigation.open',
      sessionId: sessionId,
      params: Object.assign(this.options, {
        link: path,
        relative: relativePath,
        intent: hasIntent,
        modal: modalSettings,
        splitView: splitViewSettings,
        drawer: drawerSettings
      })
    };
    helpers.sendPostMessageToLuigiCore(navigationOpenMsg);
  }

  /**
   * Opens a view in a modal. You can specify the modal's title and size. If you don't specify the title, it is the node label. If there is no node label, the title remains empty.  The default size of the modal is `l`, which means 80%. You can also use `m` (60%) and `s` (40%) to set the modal size. Optionally, use it in combination with any of the navigation functions.
   * @memberof linkManager
   * @param {string} path navigation path
   * @param {Object} [modalSettings] opens a view in a modal. Use these settings to configure the modal's title and size
   * @param {string} modalSettings.title modal title. By default, it is the node label. If there is no label, it is left empty
   * @param {('l'|'m'|'s')} [modalSettings.size="l"] size of the modal
   * @example
   * LuigiClient.linkManager().openAsModal('projects/pr1/users', {title:'Users', size:'m'});
   */
  openAsModal(path, modalSettings = {}) {
    this.navigate(path, 0, true, modalSettings);
  }

  /**
   * Opens a view in a split view. You can specify the split view's title and size. If you don't specify the title, it is the node label. If there is no node label, the title remains empty. The default size of the split view is `40`, which means 40% height of the split view.
   * @memberof linkManager
   * @param {string} path navigation path
   * @param {Object} splitViewSettings opens a view in a split view. Use these settings to configure the split view's behaviour
   * @param {string} splitViewSettings.title split view title. By default, it is the node label. If there is no label, it is left empty
   * @param {number} [splitViewSettings.size=40] height of the split view in percent
   * @param {boolean} [splitViewSettings.collapsed=false] opens split view in collapsed state
   * @returns {Object} instance of the SplitView. It provides Event listeners and you can use the available functions to control its behavior.
   * @see {@link splitView} for further documentation about the returned instance
   * @since 0.6.0
   * @example
   * const splitViewHandle = LuigiClient.linkManager().openAsSplitView('projects/pr1/logs', {title: 'Logs', size: 40, collapsed: true});
   */
  openAsSplitView(path, splitViewSettings = {}) {
    this.navigate(path, 0, true, undefined, splitViewSettings);
    return new splitViewHandle(splitViewSettings);
  }

  /**
   * Opens a view in a drawer. You can specify the size of the drawer, whether the drawer has a header, and whether a backdrop is active in the background. By default, the header is shown. The backdrop is not visible and has to be activated. The size of the drawer is set to `s` by default, which means 25% of the micro frontend size. You can also use `l`(75%), `m`(50%) or `xs`(15.5%). Optionally, use it in combination with any of the navigation functions.
   * @memberof linkManager
   * @param {string} path navigation path
   * @param {Object} drawerSettings opens a view in a drawer. Use these settings to configure if the drawer has a header, backdrop and size.
   * @param {any} drawerSettings.header By default, the header is visible. The default title is the node label, but the header could also be an object with a `title` attribute allowing you to specify your own title.  An 'x' icon is displayed to close the drawer view.
   * @param {boolean} drawerSettings.backdrop By default, it is set to `false`. If it is set to `true` the rest of the screen has a backdrop.
   * @param {('l'|'m'|'s'|'xs')} [drawerSettings.size="s"] size of the drawer
   * @since 1.6.0
   * @example
   * LuigiClient.linkManager().openAsDrawer('projects/pr1/drawer', {header:true, backdrop:true, size:'s'});
   * LuigiClient.linkManager().openAsDrawer('projects/pr1/drawer', {header:{title:'My drawer component'}, backdrop:true, size:'xs'});
   */
  openAsDrawer(path, drawerSettings = {}) {
    this.navigate(path, 0, true, undefined, undefined, drawerSettings);
  }

  /**
   * Sets the current navigation context to that of a specific parent node which has the {@link navigation-configuration.md navigationContext} field declared in the navigation configuration. This navigation context is then used by the `navigate` function.
   * @memberof linkManager
   * @param {string} navigationContext
   * @returns {linkManager} link manager instance
   * @example
   * LuigiClient.linkManager().fromContext('project').navigate('/settings')
   */
  fromContext(navigationContext) {
    const navigationContextInParent =
      this.currentContext.context.parentNavigationContexts &&
      this.currentContext.context.parentNavigationContexts.indexOf(navigationContext) !== -1;
    if (navigationContextInParent) {
      this.options.fromContext = navigationContext;
    } else {
      this.options.errorSkipNavigation = true;
      console.error('Navigation not possible, navigationContext ' + navigationContext + ' not found.');
    }
    return this;
  }

  /**
   * Sets the current navigation context which is then used by the `navigate` function. This has to be a parent navigation context, it is not possible to use the child navigation contexts.
   * @memberof linkManager
   * @returns {linkManager} link manager instance
   * @example
   * LuigiClient.linkManager().fromClosestContext().navigate('/users/groups/stakeholders')
   */
  fromClosestContext() {
    const hasParentNavigationContext =
      this.currentContext && this.currentContext.context.parentNavigationContexts.length > 0;
    if (hasParentNavigationContext) {
      this.options.fromContext = null;
      this.options.fromClosestContext = true;
    } else {
      console.error('Navigation not possible, no parent navigationContext found.');
    }
    return this;
  }
  /**
   * Sets the current navigation base to the parent node that is defined as virtualTree. This method works only when the currently active micro frontend is inside a virtualTree.
   * @memberof linkManager
   * @returns {linkManager} link manager instance
   * @since 1.0.1
   * @example
   * LuigiClient.linkManager().fromVirtualTreeRoot().navigate('/users/groups/stakeholders')
   */
  fromVirtualTreeRoot() {
    this.options.fromContext = null;
    this.options.fromClosestContext = false;
    this.options.fromVirtualTreeRoot = true;
    return this;
  }

  /**
   * Enables navigating to sibling nodes without knowing the absolute path.
   * @memberof linkManager
   * @returns {linkManager} link manager instance
   * @since 1.0.1
   * @example
   * LuigiClient.linkManager().fromParent().navigate('/sibling')
   */
  fromParent() {
    this.options.fromParent = true;
    return this;
  }

  /**
   * Sends node parameters to the route. The parameters are used by the `navigate` function. Use it optionally in combination with any of the navigation functions and receive it as part of the context object in Luigi Client.
   * @memberof linkManager
   * @param {Object} nodeParams
   * @returns {linkManager} link manager instance
   * @example
   * LuigiClient.linkManager().withParams({foo: "bar"}).navigate("path")
   *
   * // Can be chained with context setting functions such as:
   * LuigiClient.linkManager().fromContext("currentTeam").withParams({foo: "bar"}).navigate("path")
   */
  withParams(nodeParams) {
    if (nodeParams) {
      Object.assign(this.options.nodeParams, nodeParams);
    }
    return this;
  }

  /** @lends linkManager */
  /**
   * Checks if the path you can navigate to exists in the main application. For example, you can use this helper method conditionally to display a DOM element like a button.
   * @memberof linkManager
   * @param {string} path path which existence you want to check
   * @returns {promise} a promise which resolves to a Boolean variable specifying whether the path exists or not
   * @example
   *  let pathExists;
   *  LuigiClient
   *  .linkManager()
   *  .pathExists('projects/pr2')
   *  .then(
   *    (pathExists) => {  }
   *  );
   */
  pathExists(path) {
    const currentId = Date.now();
    const pathExistsPromises = this.getPromise('pathExistsPromises') || {};
    pathExistsPromises[currentId] = {
      resolveFn: function() {},
      then: function(resolveFn) {
        this.resolveFn = resolveFn;
      }
    };
    this.setPromise('pathExistsPromises', pathExistsPromises);

    // register event listener, which will be cleaned up after this usage
    helpers.addEventListener(
      'luigi.navigation.pathExists.answer',
      function(e, listenerId) {
        const data = e.data.data;
        const pathExistsPromises = this.getPromise('pathExistsPromises') || {};
        if (pathExistsPromises[data.correlationId]) {
          pathExistsPromises[data.correlationId].resolveFn(data.pathExists);
          delete pathExistsPromises[data.correlationId];
          this.setPromise('pathExistsPromises', pathExistsPromises);
        }
        helpers.removeEventListener(listenerId);
      }.bind(this)
    );

    const pathExistsMsg = {
      msg: 'luigi.navigation.pathExists',
      data: {
        id: currentId,
        link: path,
        relative: path[0] !== '/'
      }
    };
    helpers.sendPostMessageToLuigiCore(pathExistsMsg);
    return pathExistsPromises[currentId];
  }

  /**
   * Checks if there is one or more preserved views. You can use it to show a **back** button.
   * @memberof linkManager
   * @returns {boolean} indicating if there is a preserved view you can return to
   */
  hasBack() {
    return !!this.currentContext.internal.modal || this.currentContext.internal.viewStackSize !== 0;
  }

  /**
   * Discards the active view and navigates back to the last visited view. Works with preserved views, and also acts as the substitute of the browser **back** button. **goBackContext** is only available when using preserved views.
   * @memberof linkManager
   * @param {any} goBackValue data that is passed in the **goBackContext** field to the last visited view when using preserved views
   * @example
   * LuigiClient.linkManager().goBack({ foo: 'bar' });
   * LuigiClient.linkManager().goBack(true);
   */
  goBack(goBackValue) {
    helpers.sendPostMessageToLuigiCore({
      msg: 'luigi.navigation.back',
      goBackContext: goBackValue && JSON.stringify(goBackValue)
    });
  }

  /**
   * Disables the navigation handling for a single navigation request
   * It prevents Luigi Core from handling url change after `navigate()`.
   * Used for auto-navigation
   * @since 0.7.7
   * @example
   * LuigiClient.linkManager().withoutSync().navigate('/projects/xy/foobar');
   * LuigiClient.linkManager().withoutSync().fromClosestContext().navigate('settings');
   */
  withoutSync() {
    this.options.withoutSync = true;
    return this;
  }
}
