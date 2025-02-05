"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AiChatSession } from '@/configs/AiModel'
import { useUser } from '@clerk/nextjs'
import { JsonForms } from '@/configs/schema'
import { db } from '@/configs'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const CreateForm = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState();
    const { user } = useUser();
    const route = useRouter();

    const PROMPT = `
Generate a JSON object with the following structure:

{
  "formTitle": "Title of the form",
  "formHeading": "Short description of the form",
  "fields": [
    {
      "fieldName": "Unique field identifier",
      "fieldTitle": "Title of the field",
      "placeholder": "Placeholder text for the field",
      "label": "Label for the field",
      "fieldType": "Type of the field (e.g., 'text', 'email', 'password', 'date', 'checkbox', 'radio', 'select')",
      "required": true or false,
      "options": [
        {
          "label": "Visible label for option",
          "value": "Value associated with the option"
        }
      ] // Include 'options' **only** for 'select', 'radio', and 'checkbox' fields
    }
  ]
}


Ensure the output is in **valid JSON format** with all keys and values enclosed in **double quotes**, except for boolean values which should be \`true\` or \`false\`.
`;

    const onCreateForm = async () => {
        console.log(userInput);
        setLoading(true);
        const result = await AiChatSession.sendMessage("Description:" + userInput + PROMPT);

        if (result.response.text()) {
            const resp = await db.insert(JsonForms)
                .values({
                    jsonform: result.response.text(),
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD/MM/YYYY')
                }).returning({ id: JsonForms.id })
            console.log("New Inserted form id :", resp[0].id);
            if (resp[0].id) {
                route.push('/edit-form/' + resp[0].id)
            }

            setLoading(false);
        }
        setLoading(false);
    }

    return (
        <div>
            <Button onClick={() => setOpenDialog(true)}>+ Create Form</Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Form</DialogTitle>
                        <DialogDescription>
                            Write a short description for your form.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Move this outside of DialogDescription */}
                    <Textarea
                        className="my-2"
                        onChange={(event) => setUserInput(event.target.value)}
                        placeholder='Write your description here'
                    />

                    <div className='flex my-3 justify-end gap-2'>
                        <Button variant="destructive" onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button disabled={loading} onClick={onCreateForm}>{loading ? <Loader2 className='animate-spin' /> : 'Create'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateForm
