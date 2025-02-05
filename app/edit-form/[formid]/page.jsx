"use client";
import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Share2, SquareArrowOutUpRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import FormUi from "../_components/FormUi";
import { toast } from "sonner";
import Controller from "../_components/Controller";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RWebShare } from "react-web-share";

const EditForm = () => {
    const params = useParams();
    const { user } = useUser();
    const [jsonForm, setJsonForm] = useState(null);
    const [record, setRecord] = useState(null);  // Ensure it's not empty
    const router = useRouter();
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [selectedBackground, setSelectedbackground] = useState();
    const [selectedStyle, setSelectedStyle] = useState();

    useEffect(() => {
        if (user && params?.formid) {
            GetFormData();
        }
    }, [user, params?.formid]);

    const GetFormData = async () => {
        try {
            const result = await db
                .select()
                .from(JsonForms)
                .where(
                    and(
                        eq(JsonForms.id, params.formid),
                        eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
                    )
                );

            if (result.length === 0) {
                console.warn("No form data found.");
                return;
            }

            const parsedData = JSON.parse(result[0].jsonform);
            setRecord(result[0]);
            setJsonForm(parsedData);
            setSelectedbackground(result[0].background);
            setSelectedTheme(result[0].theme);
            setSelectedStyle(JSON.parse(result[0].style));
        } catch (error) {
            console.error("Error fetching form data:", error);
        }
    };

    const updateJsonFormInDb = async (updatedJson) => {
        try {
            await db.update(JsonForms)
                .set({
                    jsonform: JSON.stringify(updatedJson)  // Ensure JSON string format
                })
                .where(and(eq(JsonForms.id, record.id), eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)));

            console.log("Database updated successfully");
        } catch (error) {
            console.error("Error updating form data:", error);
        }
    };

    const onFieldUpdate = (value, index) => {
        setJsonForm((prevJsonForm) => {
            const updatedJson = { ...prevJsonForm };  // Copy the object
            updatedJson.fields = [...prevJsonForm.fields];  // Copy the array

            updatedJson.fields[index] = {
                ...updatedJson.fields[index],  // Copy field object
                label: value.label,
                placeholder: value.placeholder
            };

            updateJsonFormInDb(updatedJson); // Pass updated state to DB
            toast("Updated!!!");
            return updatedJson;
        });
    };

    const deletefield = async (indexToRemove) => {
        setJsonForm((prevJsonForm) => {
            const updatedJson = { ...prevJsonForm };  // Copy the object
            updatedJson.fields = prevJsonForm.fields.filter((_, index) => index !== indexToRemove);  // Remove field

            updateJsonFormInDb(updatedJson); // Update the database
            return updatedJson;
        });
    };

    const updateControllerFields = async (value, columnName) => {
        console.log(value, columnName)
        const result = await db.update(JsonForms).set({
            [columnName]: value
        }).where(and(eq(JsonForms.id, record.id),
            eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)))
            .returning({ id: JsonForms.id })

        toast('Updated!!!')

    }

    return (

        <div className='p-10'>
            <div className='flex justify-between items-center'>
                <h2 className='flex gap-2 items-center my-5 cursor-pointer
        hover:font-bold ' onClick={() => router.back()}>
                    <ArrowLeft /> Back
                </h2>
                <div className='flex gap-2'>
                    <Link href={'/aiform/' + record?.id} target="_blank">
                        <Button className="flex gap-2" > <SquareArrowOutUpRight className='h-5 w-5' /> Live Preview</Button>
                    </Link>
                    <RWebShare
                        data={{
                            text: jsonForm?.formHeading + " , Build your form in seconds with AI form Builder ",
                            url: process.env.NEXT_PUBLIC_BASE_URL + "/aiform/" + record?.id,
                            title: jsonForm?.formTitle,
                        }}
                        onClick={() => console.log("shared successfully!")}
                    >
                        <Button className="flex gap-2 bg-green-600 hover:bg-green-700"> <Share2 /> Share</Button>

                    </RWebShare>

                </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 border rounded-lg shadow-md"><Controller
                    selectedTheme={(value) => {
                        updateControllerFields(value, 'theme')
                        setSelectedTheme(value)
                    }}
                    selectedBackground={(value) => {
                        updateControllerFields(value, 'background')
                        setSelectedbackground(value)
                    }}
                    selectedStyle={(value) => {
                        setSelectedStyle(value);
                        updateControllerFields(value, 'style')
                    }}
                    setSignInEnable={(value) => {
                        updateControllerFields(value, 'enabledSignIn')
                    }}
                />
                </div>
                <div className="md:col-span-2 border rounded-lg p-3 shadow-md flex items-center justify-center" style={{ backgroundImage: selectedBackground }}>
                    {jsonForm ? <FormUi
                        jsonForm={jsonForm}
                        onFieldUpdate={onFieldUpdate}
                        deletefield={(index) => deletefield(index)}
                        selectedTheme={selectedTheme}
                        selectedStyle={selectedStyle}
                        formId={record?.id}
                    /> : <p>Loading...</p>}
                </div>
            </div>
        </div>
    );
};

export default EditForm;
