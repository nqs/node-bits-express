import _ from 'lodash';
import express from 'express';
import {BEFORE_CONFIGURE_ROUTES, AFTER_CONFIGURE_ROUTES, VERBS} from 'node-bits';

export default (app, config) => {
  const router = express.Router(); // eslint-disable-line

  const callHooks = (action, args) => {
    _.forEach(config.hooks, hook => {
      if (!hook[action]) {
        return;
      }

      hook[action](args);
    });
  };

  const args = {app, router, routes: config.routes, database: config.database};

  callHooks(BEFORE_CONFIGURE_ROUTES, args);

  _.forEach(config.routes, routeDefinition => {
    const {verb, route, implementation} = routeDefinition;

    // only accept certain verbs
    if (!verb || !VERBS.includes(verb.toLowerCase())) {
      return;
    }

    router[verb](route, (req, res) => {
      implementation[verb](req, res);
    });
  });

  callHooks(AFTER_CONFIGURE_ROUTES, args);

  app.use(router);
};
