const renderRouteName = () => BlazeLayout.render('layout', { main: FlowRouter.getRouteName() });
const route = name => FlowRouter.route(`/${name}`, { name, action: renderRouteName });

Tracker.autorun(() => {
  FlowRouter.watchPathChange();
  log('FlowRouter route', { path: FlowRouter.current().path, params: FlowRouter.current().params, queryParams: FlowRouter.current().queryParams });
});

FlowRouter.route('/', {
  name: 'home',
  action: () => { FlowRouter.go('videos'); },
});

route('viewer');
route('videos');

FlowRouter.route('/videos/:_id', { name: 'video', action: renderRouteName });
