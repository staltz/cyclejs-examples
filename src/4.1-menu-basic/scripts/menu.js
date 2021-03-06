// IMPORTS =========================================================================================
let Cycle = require("cyclejs");
let {Rx, h} = Cycle;
let makeClass = require("classnames");

// COMPONENTS ======================================================================================
Cycle.registerCustomElement("Menu", (DOM, Props) => {
  let Model = Cycle.createModel((Intent, Props) => {
    let items$ = Props.get("items$");
    let active$ = Props.get("active$");
    let selectActive$ = Intent.get("selectActive$");
    return {
      items$: items$,
      active$: active$.merge(selectActive$),
    }
  });

  let View = Cycle.createView(Model => {
    let items$ = Model.get("items$");
    let active$ = Model.get("active$");
    return {
      vtree$: items$.combineLatest(active$, (items, active) => {
        return (
          <div>
            <nav>
              {items.map(item =>
                <div attributes={{"data-name": item}} key={item}
                  class={makeClass({"item": true, active: item == active})}>
                  {item}
                </div>
              )}
            </nav>
            <p>
              Selected: <b>{active}</b>
            </p>
          </div>
        );
      }),
      // TODO https://github.com/alexmingoia/jsx-transform/issues/15
    };
  });

  let Intent = Cycle.createIntent(DOM => {
    return {
      selectActive$: DOM.event$("nav .item", "click")
        .map(event => event.currentTarget.dataset.name),
    };
  });

  DOM.inject(View).inject(Model).inject(Intent, Props)[0].inject(DOM);
});
