'use client'
import React from 'react'
import { useToast } from '../ui/use-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveActivityLogsNotification, sendInvitation } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface SendInvitationProps{
    agencyId: string
}
const SendInvitation: React.FC<SendInvitationProps> = ({agencyId}) => {
    const {toast} = useToast()
    const userDataSchema = z.object({
        email: z.string().email(),
        role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST'])
    })
    const form = useForm<z.infer<typeof userDataSchema>>({
        mode: 'onChange',
        resolver: zodResolver(userDataSchema),
        defaultValues:{
            email: '',
            role: 'SUBACCOUNT_USER'
        },
    })
    const onSubmit = async(
        values: z.infer<typeof userDataSchema>
    )=>{
        try {
            const res = await sendInvitation(values.role, values.email, agencyId)
            await saveActivityLogsNotification({
                agencyId: agencyId,
                description: `Invited ${res.email}`,
                subaccountId: undefined,
            })
            toast({
                title: 'Success',
                description: 'Invitation Created and Sent',
            })
        } catch (error) {
            console.log(error);
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'Invitation Not Sent'
            })
        }
    }
  return ( 
  <Card className='w-full'>
    <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
    </CardHeader>
    <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                <FormField disabled={form.formState.isSubmitting} control={form.control} name='email' render={({field})=>(
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder='Email' {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField disabled={form.formState.isSubmitting} control={form.control} name='role' render={({field})=>(
                    <FormItem>
                        <FormLabel>User Role</FormLabel>
                        <Select onValueChange={(value)=>field.onChange(value)} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select A User Role' />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value='AGENCY_ADMIN'>Agency Admin</SelectItem>
                                <SelectItem value='SUBACCOUNT_USER'>SubAccount User</SelectItem>
                                <SelectItem value='SUBACCOUNT_GUEST'>SubAccount Guest</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <Button disabled={form.formState.isSubmitting} type='submit'>
                    {form.formState.isSubmitting ? <Loading/> : 'INVITATION SENT'}
                </Button>
            </form>
        </Form>
    </CardContent>
</Card>
  )
}

export default SendInvitation