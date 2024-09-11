'use client'
import React from 'react'
import { z } from 'zod'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createMedia, saveActivityLogsNotification } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
// import FileUpload from '../global/file-upload'
import { Button } from '../ui/button'

type Props = {
    subaccountId: string
}
const formSchema = z.object({
    link: z.string().min(1, {message: 'Media File is Required'}),
    name: z.string().min(1, {message: 'Name is Required'}),
})

const UploadMediaForm = ({subaccountId}: Props) => {
    const {toast} = useToast()
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onSubmit',
        defaultValues: {
            link: '',
            name: '',
        },
    })
    async function onSubmit(values: z.infer<typeof formSchema>){
        try {
            const response = await createMedia(subaccountId, values)
            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Uploaded a Media File | ${response.name}`,
                subaccountId,
            })
            toast({title: 'Success', description:'Uploaded Media'})
            router.refresh()
        } catch (error) {
            console.log(error);
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: 'Media Not Uploaded'
            })
            
            
        }
    }
  return (
    <Card className='w-full'>
        <CardHeader>
            <CardTitle>Media Information</CardTitle>
            <CardDescription>
                Please enter the details for your file
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField control={form.control} name='name' render={({field})=>(
                        <FormItem className='flex-1'>
                            <FormLabel>File Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Agency Name' {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name='link' render={({field})=>(
                        <FormItem>
                            <FormLabel>Media File</FormLabel>
                            <FormControl>
                                {/* <FileUpload apiEndpoint='subaccountLogo' value={field.value} onChange={field.onChange}/> */}
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <Button className='mt-4' type='submit'>
                        Upload Media
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}

export default UploadMediaForm