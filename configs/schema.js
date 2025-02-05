const { pgTable, serial, text, varchar, integer, boolean } = require("drizzle-orm/pg-core");
export const JsonForms = pgTable('jsonForms', {
    id: serial('id').primaryKey(),
    jsonform: text('jsonform').notNull(),
    theme:varchar('theme'),
    background:varchar('background'),
    style:varchar('style'),
    createdBy: varchar('createdBy', { length: 255 }).notNull(),
    createdAt: varchar('createdAt', { length: 255 }).notNull(),
    enabledSignIn:boolean('enabledSignIn').default(false)
});

export const userResponses=pgTable('userResponses',{
    id:serial('id').primaryKey(),
    jsonResponse:text('jsonResponse').notNull(),
    createdBy:varchar('createdBy').default('anonymus'),
    createdAt:varchar('createdAt').notNull(),
    formRef:integer('formRef').references(()=>JsonForms.id)
})

