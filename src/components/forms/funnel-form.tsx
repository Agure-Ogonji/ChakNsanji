'use client'
import { saveActivityLogsNotification, upsertFunnel } from '@/lib/queries'
import { useModal } from '@/providers/modal-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { v4 } from 'uuid'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import Loading from '../global/loading'
// import FileUpload from '../global/file-upload'
import { Funnel } from '@prisma/client'
import { CreateFunnelFormSchema } from '@/lib/types'
import { toast } from '../ui/use-toast'



interface CreateFunnelProps {
    defaultData?: Funnel
    subAccountId: string
}
const FunnelForm:React.FC<CreateFunnelProps> = ({defaultData, subAccountId}) => {
    const {setClose} = useModal()
    const router = useRouter()
    const form = useForm<z.infer<typeof CreateFunnelFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(CreateFunnelFormSchema),
        defaultValues:{
            name: defaultData?.name || '',
            description: defaultData?.description || '',
            favicon: defaultData?.favicon || '',
            subDomainName: defaultData?.subDomainName || '',
        },
    })
    useEffect(()=>{
        if(defaultData){
            form.reset({
                name: defaultData?.name || '',
                description: defaultData?.description || '',
                favicon: defaultData?.favicon || '',
                subDomainName: defaultData?.subDomainName || '',
            })
        }
    }, [defaultData])

    const isLoading = form.formState.isLoading

    const onSubmit = async(values: z.infer<typeof CreateFunnelFormSchema>)=>{
        if(!subAccountId) return
        const response = await upsertFunnel(
            subAccountId,
            {...values, liveProducts: defaultData?.liveProducts || '[]'},
            defaultData?.id || v4()
        )
        await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Updated A Funnel | ${response?.name}`,
            subaccountId: subAccountId,
        })
        if(response)
            toast({
                title: 'Success',
                description: 'Saved Pipeline Details',
            })
            else
                toast({
                    variant: 'destructive',
                    title: 'Oppse!',
                    description: 'It Does Not Save Funnel Details'
                })
            setClose()
            router.refresh()
        }
  return ( 
  <Card className='flex-1'>
    <CardHeader>
        <CardTitle>Funnel Details</CardTitle>
    </CardHeader>
    <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <FormField disabled={isLoading} control={form.control} name='name' render={({field})=>(
                    <FormItem>
                        <FormLabel>Funnel Name</FormLabel>
                        <FormControl>
                            <Input placeholder='Name' {...field}/>
                        </FormControl>
                    </FormItem>
                )}/>
                <FormField disabled={isLoading} control={form.control} name='description' render={({field})=>(
                    <FormItem>
                        <FormLabel>Funnel Description</FormLabel>
                        <FormControl>
                            <Input placeholder='Tell Us A little bit more about The Funnel' {...field}/>
                        </FormControl>
                    </FormItem>
                )}/>
                <FormField disabled={isLoading} control={form.control} name='subDomainName' render={({field})=>(
                    <FormItem>
                        <FormLabel>Sub Domain</FormLabel>
                        <FormControl>
                            <Input placeholder='SubDomain for Funnel' {...field}/>
                        </FormControl>
                    </FormItem>
                )}/>
                <FormField disabled={isLoading} control={form.control} name='favicon' render={({field})=>(
                    <FormItem>
                        <FormLabel>FavIcon</FormLabel>
                        <FormControl>
                            {/* <FileUpload apiEndpoint='subaccountLogo' value={field.value} onChange={field.onChange}/> */}
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <Button className='mt-4 w-20' disabled={isLoading} type='submit'>
                    {form.formState.isSubmitting ? <Loading/> : 'SAVE'}
                </Button>
            </form>
        </Form>
    </CardContent>
</Card>
  )
}

export default FunnelForm