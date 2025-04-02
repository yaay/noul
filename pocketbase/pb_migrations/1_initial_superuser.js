migrate((app) => {
    let superusers = app.findCollectionByNameOrId("_superusers")

    let record = new Record(superusers)

    record.set("email", process.env.SU_EMAIL)
    record.set("password", process.env.SU_PASSWORD)

    app.save(record)
})