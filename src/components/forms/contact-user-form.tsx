import { saveActivityLogsNotification, upsertContact } from '@/lib/queries'
import { useModal } from '@/providers/modal-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { ContactUserFormSchema } from '@/lib/types'
import { toast } from '../ui/use-toast'

interface ContactUserFormProps {
    subaccountId: string
}
const ContactUserForm: React.FC<ContactUserFormProps> = ({subaccountId}) => {
    const {setClose, data} = useModal()
    const router = useRouter()
    const form = useForm<z.infer<typeof ContactUserFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(ContactUserFormSchema),
        defaultValues:{
            name: '',
            email: '',
        },
    })
    useEffect(()=>{
        if(data.contact){
            form.reset(data.contact)
        }
    }, [data, form.reset])

    const isLoading = form.formState.isLoading

    const handleSubmit = async(
        values: z.infer<typeof ContactUserFormSchema>
    )=>{
        try {
            const response = await upsertContact({
                email: values.email,
                subAccountId: subaccountId,
                name: values.name,
                type: 'CREATE_CONTACT'
            })
            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated A Contact | ${response?.name}`,
                subaccountId: subaccountId,
            })
            toast({
                title: 'Success',
                description: 'Saved Funnel Details',
            })
            setClose()
            router.refresh()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'It Does Not Have Funnel Details'
            })
        }
    }
  return ( 
  <Card className='w-full'>
    <CardHeader>
        <CardTitle>Contact Info</CardTitle>
        <CardDescription>You Can Assign Tickets to Contacts and Set A Value For Each Contact in The Ticket</CardDescription>
    </CardHeader>
    <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
                <FormField disabled={isLoading} control={form.control} name='name' render={({field})=>(
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder='Name' {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField disabled={isLoading} control={form.control} name='email' render={({field})=>(
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder='Email' {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <Button className='mt-4' disabled={isLoading} type='submit'>
                    {form.formState.isSubmitting ? (<Loading/>) : ('SAVE CONTACT DETAILS!')}
                </Button>
            </form>
        </Form>
    </CardContent>
</Card>
  )
}

export default ContactUserForm