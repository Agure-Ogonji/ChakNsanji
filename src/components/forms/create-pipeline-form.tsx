'use client'
import { saveActivityLogsNotification, upsertPipeline } from '@/lib/queries'
import { useModal } from '@/providers/modal-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pipeline } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { CreatePipelineFormSchema } from '@/lib/types'
import { toast } from '../ui/use-toast'


interface CreatePipelineFormProps {
    defaultData?: Pipeline,
    subAccountId: string
}
const CreatePipelineForm: React.FC<CreatePipelineFormProps> = ({defaultData, subAccountId}) => {
    const {data,isOpen,setOpen,setClose} = useModal()
    const router = useRouter()
    const form = useForm<z.infer<typeof CreatePipelineFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(CreatePipelineFormSchema),
        defaultValues:{
            name: defaultData?.name || '',
        },
    })
    useEffect(()=>{
        if(defaultData){
            form.reset({
                name: defaultData?.name || '',
            })
        }
    }, [defaultData])

    const isLoading = form.formState.isLoading

    const onSubmit = async(
        values: z.infer<typeof CreatePipelineFormSchema>
    )=>{
        if(!subAccountId) return
        try {
            const response = await upsertPipeline({
                ...values,
                id: defaultData?.id,
                subAccountId: subAccountId,
            })
            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated A Pipeline | ${response?.name}`,
                subaccountId: subAccountId,
            })
            toast({
                title: 'Success',
                description: 'Saved Pipeline Details',
            })
            router.refresh()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'It Does Not Save Pipeline Details'
            })
        }
        setClose()
    }
  return ( 
  <Card className='w-full'>
    <CardHeader>
        <CardTitle>Pipeline Details</CardTitle>
    </CardHeader>
    <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <FormField disabled={isLoading} control={form.control} name='name' render={({field})=>(
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder='Name' {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <Button className='mt-4' disabled={isLoading} type='submit'>
                    {form.formState.isSubmitting ? <Loading/> : 'SAVE'}
                </Button>
            </form>
        </Form>
    </CardContent>
</Card>
  )
}

export default CreatePipelineForm