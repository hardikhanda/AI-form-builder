import { Input } from '@/components/ui/input';
import React, { useRef, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import FieldEdit from './FieldEdit';
import { JsonForms, userResponses } from '@/configs/schema';
import { db } from '@/configs';
import moment from 'moment';
import { toast } from 'sonner';
import { eq } from 'drizzle-orm';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

const FormUi = ({ jsonForm = {}, onFieldUpdate, deletefield, selectedTheme, selectedStyle, editable = true, formId = 0, enabledSignIn = false }) => {
  const fields = jsonForm.fields || []; // Ensure fields is always an array
  console.log(fields, "Hello");
  const formRef = useRef(null); // Initialize useRef correctly
  const { user, isSignedIn } = useUser();

  const [formData, setFormData] = useState({});

  // Handle Input Change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Select Change
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Checkbox Change
  const handleCheckboxChange = (fieldName, itemLabel, isChecked) => {
    setFormData((prev) => {
      const updatedList = prev[fieldName] ? [...prev[fieldName]] : [];

      if (isChecked) {
        updatedList.push(itemLabel);
      } else {
        const filteredList = updatedList.filter((item) => item !== itemLabel);
        return { ...prev, [fieldName]: filteredList };
      }

      return { ...prev, [fieldName]: updatedList };
    });
  };

  // Handle Form Submit
  const onFormSubmit = async (event) => {
    event.preventDefault();

    console.log("Attempting to insert response...");
    console.log("Form ID:", formId);

    // Check if formId exists in JsonForms table before inserting
    const formExists = await db.select().from(JsonForms).where(eq(JsonForms.id, formId));

    if (!formExists.length) {
      console.error("🚨 Form ID does not exist in database!", formId);
      return toast("Invalid form. Cannot submit response!");
    }

    try {
      const result = await db.insert(userResponses)
        .values({
          jsonResponse: JSON.stringify(formData),
          createdAt: moment().format('DD/MM/yyyy'),
          formRef: formId
        });

      console.log("Insert result:", result);

      if (result) {
        formRef.current.reset();
        setFormData({});
        toast('✅ Response Submitted Successfully!');
      }
    } catch (error) {
      console.error("🔥 Database Insert Error:", error);
      toast('❌ Error while saving your form!');
    }
  };

  return (
    <form ref={formRef} onSubmit={onFormSubmit} className='border p-5 md:w-[600px]' data-theme={selectedTheme}
      style={{
        boxShadow: selectedStyle?.key === 'boxshadow' ? '5px 5px 0px black' : undefined,
        border: selectedStyle?.key === 'border' ? selectedStyle.value : undefined
      }}
    >
      <h2 className='font-bold text-center text-2xl'>{jsonForm?.formTitle}</h2>
      <h2 className='text-sm text-gray-600 text-center'>{jsonForm?.formHeading}</h2>

      {fields.map((field, index) => (
        <div key={index} className='flex w-full gap-2 my-3'>
          {/* Select Field */}
          {field?.fieldType === 'select' ? (
            <div className='w-full'>
              <label className='text-sm text-gray-600'>{field?.label}</label>
              <Select required={field?.required} onValueChange={(value) => handleSelectChange(field.fieldName, value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field?.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field?.options?.map((item, i) => (
                    <SelectItem key={item.value || i} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          ) : field?.fieldType === 'radio' ? (
            // Radio Field
            <div className='w-full'>
              <label className='text-sm text-gray-600'>{field?.label}</label>
              <RadioGroup required={field?.required} onValueChange={(value) => handleSelectChange(field.fieldName, value)}>
                {field?.options?.map((item, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={item?.label} id={item?.label} />
                    <Label htmlFor={item?.label}>{item?.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

          ) : field?.fieldType === 'checkbox' ? (
            // Checkbox Field
            <div className='w-full'>
              <label className='text-sm text-gray-600'>{field?.label}</label>
              {field?.options?.map((item, i) => (
                <div key={i} className='flex gap-2 items-center'>
                  <Checkbox
                    checked={formData[field.fieldName]?.includes(item.label)}
                    onCheckedChange={(checked) => handleCheckboxChange(field.fieldName, item.label, checked)}
                  />
                  <h2>{item?.label}</h2>
                </div>
              ))}
            </div>

          ) : (
            // Text / Other Input Fields
            <div className='w-full'>
              <label className='text-sm text-gray-600'>{field?.label}</label>
              <Input
                type={field?.type || 'text'}
                placeholder={field?.placeholder || ''}
                name={field?.fieldName || ''}
                value={formData[field?.fieldName] || ''}
                required={field?.required}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Field Edit (For Editing Fields) */}
          {editable && (
            <FieldEdit
              defaultValue={field}
              onUpdate={(value) => onFieldUpdate(value, index)}
              deletefield={() => deletefield(index)}
            />
          )}
        </div>
      ))}

      {!enabledSignIn ?
        <button className='btn btn-primary'>Submit</button> :
        isSignedIn ?
          <button className='btn btn-primary'>Submit</button> :
          <Button>
            <SignInButton mode='modal' >Sign In before Submit</SignInButton>
          </Button>}
    </form>
  );
};

export default FormUi;
