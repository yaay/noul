migrate(
  (app) => {
    let collection = new Collection({
      type: "base",
      name: "notes",
      fields: [
        {
          type: "editor",
          name: "content",
          required: true,
        },
        {
          name: "is_online",
          type: "bool",
          required: true,
        },
        {
          name: "created_by",
          type: "relation",
          required: true,
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
        {
          name: "threadId",
          type: "relation",
          required: true,
          collectionId: "looms_collection",
          cascadeDelete: true,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
        {
          name: "is_local",
          type: "bool",
          required: true,
        },
      ],
      indexes: [],
      createRule: "@request.auth.id = created_by.id",
      deleteRule: "@request.auth.id = created_by.id",
      listRule: "@request.auth.id = created_by.id",
      updateRule: "@request.auth.id = created_by.id",
      viewRule: "@request.auth.id = created_by.id"
    });

    app.save(collection);
  },
  (app) => {
    let collection = app.findCollectionByNameOrId("notes");
    app.delete(collection);
  }
);
