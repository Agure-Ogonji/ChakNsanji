'use client'
import { Agency, SubAccount } from '@prisma/client'
import React, { useEffect } from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { useModal } from '@/providers/modal-provider'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 } from 'uuid'
import { saveActivityLogsNotification, upsertSubAccount } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
// import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'



const formSchema = z.object({
    name: z.string(),
    companyEmail: z.string(),
    companyPhone: z.string().min(1),
    address: z.string(),
    city: z.string(),
    // subAccountLogo: z.string(),
    zipCode: z.string(),
    state: z.string(),
    country: z.string()
})
interface SubAccountDetailsProps {
    agencyDetails: Agency
    details?: Partial<SubAccount>
    userId: string
    userName: string
}
const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
    
    details,
    agencyDetails,
    userId,
    userName
}) => {
    const {toast} = useToast()
    const {setClose} = useModal()
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues:{
            name: details?.name,
            companyEmail: details?.companyEmail,
            companyPhone: details?.companyPhone,
            address: details?.address,
            city: details?.city,
            zipCode: details?.zipCode,
            state: details?.state,
            country: details?.country,
            // subAccountLogo: details?.subAccountLogo,
        },
    })
    
    async function onSubmit(
        values: z.infer<typeof formSchema>
    ){
        try {
            const response = await upsertSubAccount({
                    id: details?.id ? details.id : v4(),
                    address: values.address,
                    // subAccountLogo: values.subAccountLogo,
                    city: values.city,
                    companyPhone: values.companyPhone,
                    country: values.country,
                    name: values.name,
                    state: values.state,
                    zipCode: values.zipCode,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    companyEmail: values.companyEmail,
                    agencyId: agencyDetails?.id,
                    connectAccountId: '',
                    goal: 5000,
        })
        if(!response) throw new Error("NO RESPONSE FROM SERVER")
            await saveActivityLogsNotification({
                agencyId: response.agencyId,
                description: `${userName} | Updated A SubAccount | ${response.name}`,
                subaccountId: response.id,
            })
            toast({
                title: 'SubAccount Details Saved',
                description: 'Saved SubAccount Details',
            })
            setClose()
            router.refresh()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'It Does Not Save SubAccount Details'
            })
        }
    }
    useEffect(()=>{
        if(details){
            form.reset(details)
        }
    }, [details])

    const isLoading = form.formState.isSubmitting
  return ( 
  <Card className='w-full'>
    <CardHeader>
        <CardTitle>SubAccount Information</CardTitle>
        <CardDescription>
            Please Enter Business Details
        </CardDescription>
    </CardHeader>
    <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                {/* <FormField disabled={isLoading} control={form.control} name='subAccountLogo' render={({field})=>(
                    <FormItem>
                        <FormLabel>Account Logo</FormLabel>
                        <FormControl>
                            <FileUpload apiEndpoint='subaccountLogo' value={field.value} onChange={field.onChange}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/> */}
                <div className='flex md:flex-grow gap-4'>
                    <FormField disabled={isLoading} control={form.control} name='name' render={({field})=>(
                        <FormItem className='flex-1'>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Agency Name' {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField disabled={isLoading} control={form.control} name='companyEmail' render={({field})=>(
                        <FormItem className='flex-1'>
                            <FormLabel>Account Email</FormLabel>
                            <FormControl>
                                <Input placeholder='Email' {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>
                <div className='flex md:flex-grow gap-4'>
                    <FormField disabled={isLoading} control={form.control} name='companyPhone' render={({field})=>(
                        <FormItem className='flex-1'>
                            <FormLabel>Account Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder='Phone' {...field} required/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>
                <FormField disabled={isLoading} control={form.control} name='address' render={({field})=>(
                    <FormItem className='flex-1'>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Input required placeholder='432 st...' {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <div className='flex md:flex-grow gap-4'>
                    <FormField disabled={isLoading} control={form.control} name='city' render={({field})=>(
                        <FormItem className='flex-1'>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input placeholder='City' {...field} required/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField disabled={isLoading} control={form.control} name='state' render={({field})=>(
                        <FormItem className='flex-1'>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                                <Input placeholder='State' {...field} required/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField disabled={isLoading} control={form.control} name='zipCode' render={({field})=>(
                        <FormItem className='flex-1'>
                            <FormLabel>ZipCode</FormLabel>
                            <FormControl>
                                <Input placeholder='ZipCode' {...field} required/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>
                <FormField disabled={isLoading} control={form.control} name='country' render={({field})=>(
                    <FormItem className='flex-1'>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                            <Input placeholder='Country' {...field} required/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                    <Button disabled={isLoading} type='submit'>
                        {isLoading ? <Loading/> : 'SAVE ACCOUNT INFO'}
                    </Button>
            </form>
        </Form>
    </CardContent>
</Card>
  )
}

export default SubAccountDetails