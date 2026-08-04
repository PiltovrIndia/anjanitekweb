'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Separator } from '@/app/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Card } from '@/app/components/ui/card'
import { SpinnerGap, X, ShoppingCart } from 'phosphor-react'
import { Search, Trash2, AlertCircle, Info, UserPlus } from 'lucide-react'

export default function StockOrderDialog({ id, isOpen, onClose, pass, role, onSuccess }) {

    // ── Dealer search ─────────────────────────────────────────────────────
    const [dealerQuery, setDealerQuery] = useState('')
    const [dealerResults, setDealerResults] = useState([])
    const [searchingDealers, setSearchingDealers] = useState(false)
    const [selectedDealer, setSelectedDealer] = useState(null)
    const [recipientType, setRecipientType] = useState('dealer')
    const [showDealerDrop, setShowDealerDrop] = useState(false)
    const dealerTimer = useRef(null)
    const dealerRef = useRef(null)

    // ── Customer search and creation ─────────────────────────────────────
    const [customerQuery, setCustomerQuery] = useState('')
    const [customerResults, setCustomerResults] = useState([])
    const [searchingCustomers, setSearchingCustomers] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [showCustomerDrop, setShowCustomerDrop] = useState(false)
    const [showCustomerForm, setShowCustomerForm] = useState(false)
    const [creatingCustomer, setCreatingCustomer] = useState(false)
    const [customerError, setCustomerError] = useState(null)
    const [customerForm, setCustomerForm] = useState({ name: '', mobile: '', email: '' })
    const customerTimer = useRef(null)
    const customerRef = useRef(null)

    // ── Design search ─────────────────────────────────────────────────────
    const [designQuery, setDesignQuery] = useState('')
    const [designResults, setDesignResults] = useState([])
    const [searchingDesigns, setSearchingDesigns] = useState(false)
    const [showDesignDrop, setShowDesignDrop] = useState(false)
    const designTimer = useRef(null)
    const designRef = useRef(null)

    // ── Cart ──────────────────────────────────────────────────────────────
    const [cartItems, setCartItems] = useState([])  // { product, stockType, quantity, error }

    // ── Ordering ──────────────────────────────────────────────────────────
    const [placing, setPlacing] = useState(false)
    const [orderError, setOrderError] = useState(null)

    // ── Reset on dialog close ─────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) {
            setDealerQuery(''); setDealerResults([]); setSelectedDealer(null); setShowDealerDrop(false)
            setCustomerQuery(''); setCustomerResults([]); setSelectedCustomer(null); setShowCustomerDrop(false)
            setRecipientType('dealer')
            setShowCustomerForm(false); setCreatingCustomer(false); setCustomerError(null); setCustomerForm({ name: '', mobile: '', email: '' })
            setDesignQuery(''); setDesignResults([]); setShowDesignDrop(false)
            setCartItems([]); setPlacing(false); setOrderError(null)
        }
    }, [isOpen])

    // ── Close dropdowns when clicking outside ────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dealerRef.current && !dealerRef.current.contains(e.target)) setShowDealerDrop(false)
            if (customerRef.current && !customerRef.current.contains(e.target)) setShowCustomerDrop(false)
            if (designRef.current && !designRef.current.contains(e.target)) setShowDesignDrop(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // ── Dealer search ─────────────────────────────────────────────────────
    const handleDealerSearch = (value) => {
        setDealerQuery(value)
        setSelectedDealer(null)
        clearTimeout(dealerTimer.current)
        if (!value.trim()) { setDealerResults([]); setShowDealerDrop(false); return }
        dealerTimer.current = setTimeout(async () => {
            setSearchingDealers(true)
            try {
                const res = await fetch(`/api/v2/user/${pass}/U9.1/${role}/${encodeURIComponent(value)}`, {
                    headers: { 'Content-Type': 'application/json' },
                })
                const data = await res.json()
                setDealerResults(data.status === 200 ? data.data : [])
                setShowDealerDrop(true)
            } catch { setDealerResults([]) }
            finally { setSearchingDealers(false) }
        }, 400)
    }

    const selectDealer = (dealer) => {
        setSelectedDealer(dealer)
        setDealerQuery('')
        setShowDealerDrop(false)
        setDealerResults([])
        setCustomerQuery(''); setCustomerResults([]); setSelectedCustomer(null); setShowCustomerDrop(false)
        setShowCustomerForm(false); setCustomerError(null); setCustomerForm({ name: '', mobile: '', email: '' })
        setCartItems([])
    }

    const clearCustomer = () => {
        setCustomerQuery(''); setCustomerResults([]); setSelectedCustomer(null); setShowCustomerDrop(false)
        setShowCustomerForm(false); setCustomerError(null); setCustomerForm({ name: '', mobile: '', email: '' })
        setCartItems([])
    }

    const selectRecipientType = (type) => {
        if (type === recipientType) return
        setRecipientType(type)
        setDealerQuery(''); setDealerResults([]); setSelectedDealer(null); setShowDealerDrop(false)
        setCustomerQuery(''); setCustomerResults([]); setSelectedCustomer(null); setShowCustomerDrop(false)
        setShowCustomerForm(false); setCustomerError(null); setCustomerForm({ name: '', mobile: '', email: '' })
        setCartItems([])
    }

    const handleCustomerSearch = (value) => {
        setCustomerQuery(value)
        setSelectedCustomer(null)
        setCustomerError(null)
        clearTimeout(customerTimer.current)
        if (!value.trim()) {
            setCustomerResults([])
            setShowCustomerDrop(false)
            return
        }
        customerTimer.current = setTimeout(async () => {
            setSearchingCustomers(true)
            try {
                const res = await fetch(`/api/v2/user/${pass}/U9.2/${encodeURIComponent(value)}`, {
                    headers: { 'Content-Type': 'application/json' },
                })
                const data = await res.json()
                setCustomerResults(data.status === 200 ? data.data : [])
                setShowCustomerDrop(true)
            } catch {
                setCustomerResults([])
                setShowCustomerDrop(true)
            } finally {
                setSearchingCustomers(false)
            }
        }, 400)
    }

    const selectCustomer = (customer) => {
        setSelectedCustomer(customer)
        setCustomerQuery('')
        setCustomerResults([])
        setShowCustomerDrop(false)
        setShowCustomerForm(false)
        setCustomerError(null)
        setSelectedDealer(null)
        setCartItems([])
    }

    const openCustomerForm = () => {
        setCustomerForm({ name: customerQuery.trim(), mobile: '', email: '' })
        setCustomerError(null)
        setShowCustomerDrop(false)
        setShowCustomerForm(true)
    }

    const createCustomer = async () => {
        const name = customerForm.name.trim()
        const mobile = customerForm.mobile.trim()
        const email = customerForm.email.trim()
        if (name.length < 3) {
            setCustomerError('Enter a customer name with at least 3 characters.')
            return
        }
        if (mobile.length < 10) {
            setCustomerError('Enter a valid mobile number.')
            return
        }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            setCustomerError('Enter a valid email address or leave it blank.')
            return
        }

        setCreatingCustomer(true)
        setCustomerError(null)
        const customerId = `C${String(Date.now()).slice(-9)}${Math.floor(Math.random() * 900 + 100)}`
        const customer = {
            id: customerId,
            name,
            designation: 'Customer',
            email,
            mobile,
            role: 'Customer',
            mapTo: id,
            relatedTo: id,
            userImage: '-',
            gcm_regId: '-',
            isActive: 1,
        }

        try {
            const res = await fetch(`/api/v2/user/${pass}/U11/${encodeURIComponent(role || 'GlobalAdmin')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer),
            })
            const data = await res.json()
            if (data.status !== 200) {
                setCustomerError(data.message || 'Unable to create customer.')
                return
            }
            selectCustomer(customer)
        } catch {
            setCustomerError('Unable to create customer. Please try again.')
        } finally {
            setCreatingCustomer(false)
        }
    }

    // ── Design search ─────────────────────────────────────────────────────
    const handleDesignSearch = (value) => {
        setDesignQuery(value)
        clearTimeout(designTimer.current)
        if (!value.trim()) { setDesignResults([]); setShowDesignDrop(false); return }
        designTimer.current = setTimeout(async () => {
            setSearchingDesigns(true)
            try {
                const res = await fetch(`/api/v2/products/${pass}/U4/${encodeURIComponent(value)}/0`, {
                    headers: { 'Content-Type': 'application/json' },
                })
                const data = await res.json()
                setDesignResults(data.status === 200 ? data.data : [])
                setShowDesignDrop(true)
            } catch { setDesignResults([]) }
            finally { setSearchingDesigns(false) }
        }, 400)
    }

    const addToCart = (product) => {
        if (cartItems.some(i => i.product.productId === product.productId)) {
            setDesignQuery(''); setDesignResults([]); setShowDesignDrop(false); return
        }
        setCartItems(prev => [...prev, { product, stockType: 'prm', quantity: '', error: null }])
        setDesignQuery(''); setDesignResults([]); setShowDesignDrop(false)
    }

    // ── Cart item update & validation ─────────────────────────────────────
    const updateItem = (productId, field, value) => {
        setCartItems(prev => prev.map(i => {
            if (i.product.productId !== productId) return i
            const updated = { ...i, [field]: value }
            const qty = Number(field === 'quantity' ? value : updated.quantity)
            const type = field === 'stockType' ? value : updated.stockType
            const availPrm = Number(updated.product.prm) || 0
            const availStd = Number(updated.product.std) || 0

            if (!value && field === 'quantity') {
                updated.error = null // empty — will catch at submit
            } else if (qty < 1) {
                updated.error = 'Quantity must be at least 1'
            } else if (type === 'std' && qty > availStd) {
                updated.error = `Max available STD stock is ${availStd}`
            } else {
                updated.error = null
            }
            return updated
        }))
    }

    const removeFromCart = (productId) => setCartItems(prev => prev.filter(i => i.product.productId !== productId))

    // ── Build the designs array for the request body ──────────────────────
    // PRM rule: if qty > available, split into (available, isProduction=false) + (rest, isProduction=true)
    // STD rule: qty <= available, single entry, isProduction=false
    const buildDesignsArray = () => {
        
        
        const designs = []
        const atlCartId = `C${Date.now()}`
        const vclCartId = `C${Date.now()+1}`
        let serialId = 1
        for (const item of cartItems) {
            
            const qty = Number(item.quantity)
            const availPrm = Number(item.product.prm) || 0
            if (item.stockType === 'prm' && qty > availPrm) {
                if (availPrm > 0) {
                    designs.push({ cartId: (item.product.designType == 1) ? atlCartId : vclCartId,  serialId: serialId++, dealerId: selectedRecipient.id, productId: item.product.productId, design: item.product.design, quantity: availPrm, stockType: 'prm', isProduction: false })
                }
                designs.push({ cartId: (item.product.designType == 1) ? atlCartId : vclCartId, serialId: serialId++, dealerId: selectedRecipient.id, productId: item.product.productId, design: item.product.design, quantity: qty - availPrm, stockType: 'prm', isProduction: true })
            } else {
                designs.push({ cartId: (item.product.designType == 1) ? atlCartId : vclCartId, serialId: serialId++, dealerId: selectedRecipient.id, productId: item.product.productId, design: item.product.design, quantity: qty, stockType: item.stockType, isProduction: false })
            }
        }
        return designs
    }

    // ── Place order ───────────────────────────────────────────────────────
    const hasErrors = cartItems.some(i => i.error)
    const hasEmptyQty = cartItems.some(i => !i.quantity || Number(i.quantity) < 1)
    const selectedRecipient = recipientType === 'dealer' ? selectedDealer : selectedCustomer
    const canPlace = selectedRecipient && cartItems.length > 0 && !hasErrors && !hasEmptyQty && !placing

    const handlePlaceOrder = async () => {
        if (!canPlace) return
        setPlacing(true); setOrderError(null)
        try {
            const now = new Date()
            const p = (n) => String(n).padStart(2, '0')
            const createdOn = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`

            const body = {
                userId: id,
                designs: buildDesignsArray(),
                createdOn,
            }

            const res = await fetch(`/api/v2/orders_test/${pass}/U4`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()

            if (data.status === 200 && data.data > 0) {
                onSuccess?.(`Stock order placed! ${data.data} reservation${data.data !== 1 ? 's' : ''} created for ${selectedRecipient.name}.`)
                onClose()
            } else {
                setOrderError(data.message || 'Order failed. Please try again.')
            }
        } catch (e) {
            setOrderError('Network error. Please try again.')
        } finally {
            setPlacing(false)
        }
    }

    const totalBoxes = cartItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col gap-0 p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        Add Stock Order
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 px-6 pt-4 pb-2 overflow-y-auto flex-1 min-h-0">

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Place order for</Label>
                        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Order recipient type">
                            <Button type="button" variant={recipientType === 'dealer' ? 'default' : 'outline'} className={recipientType === 'dealer' ? 'bg-green-600 text-white hover:bg-green-700' : ''} onClick={() => selectRecipientType('dealer')}>
                                Dealer
                            </Button>
                            <Button type="button" variant={recipientType === 'customer' ? 'default' : 'outline'} className={recipientType === 'customer' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''} onClick={() => selectRecipientType('customer')}>
                                Customer
                            </Button>
                        </div>
                    </div>

                    {/* ── Dealer section ── */}
                    {recipientType === 'dealer' ? (
                    <div className="space-y-1.5" ref={dealerRef}>
                        <Label className="text-sm font-medium">Dealer</Label>
                        {selectedDealer ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex-1">
                                    <span className="font-medium text-sm text-green-800">{selectedDealer.name}</span>
                                    <span className="text-xs text-green-600 ml-2 font-mono">{selectedDealer.id}</span>
                                </div>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-red-500 hover:bg-transparent"
                                    onClick={() => { setSelectedDealer(null); clearCustomer() }}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    placeholder="Search dealer by name or ID..."
                                    value={dealerQuery}
                                    onChange={(e) => handleDealerSearch(e.target.value)}
                                    onFocus={() => dealerResults.length > 0 && setShowDealerDrop(true)}
                                    className="pr-9"
                                />
                                {searchingDealers
                                    ? <SpinnerGap className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                                    : <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                                }
                                {showDealerDrop && dealerResults.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {dealerResults.map(d => (
                                            <div key={d.id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                                onMouseDown={() => selectDealer(d)}>
                                                <span className="font-medium text-sm">{d.name}</span>
                                                <span className="font-mono text-xs text-gray-400">{d.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showDealerDrop && !searchingDealers && dealerResults.length === 0 && dealerQuery.trim() && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow p-3 text-sm text-gray-500">
                                        No dealers found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    ) : null}

                    {/* ── Customer section ───────────────────────────── */}
                    {recipientType === 'customer' ? (
                    <div className="space-y-1.5" ref={customerRef}>
                        <Label className="text-sm font-medium">Customer</Label>
                        {selectedCustomer ? (
                            <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                                <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium text-blue-900">{selectedCustomer.name}</span>
                                    <span className="ml-2 font-mono text-xs text-blue-700">{selectedCustomer.id}</span>
                                    {selectedCustomer.mobile ? <div className="text-xs text-blue-700">{selectedCustomer.mobile}</div> : null}
                                </div>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-700 hover:bg-transparent hover:text-red-500" onClick={clearCustomer}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : showCustomerForm ? (
                            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-slate-900">New customer</span>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={creatingCustomer} onClick={() => { setShowCustomerForm(false); setCustomerError(null) }}>
                                        Search existing
                                    </Button>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="customer-name" className="text-xs">Name</Label>
                                        <Input id="customer-name" value={customerForm.name} onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))} placeholder="Customer name" disabled={creatingCustomer} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="customer-mobile" className="text-xs">Mobile</Label>
                                        <Input id="customer-mobile" inputMode="numeric" value={customerForm.mobile} onChange={(event) => setCustomerForm((current) => ({ ...current, mobile: event.target.value.replace(/\D/g, '') }))} placeholder="Mobile number" disabled={creatingCustomer} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="customer-email" className="text-xs">Email <span className="text-slate-400">optional</span></Label>
                                        <Input id="customer-email" type="email" value={customerForm.email} onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" disabled={creatingCustomer} />
                                    </div>
                                </div>
                                {customerError ? <p className="text-xs text-red-600">{customerError}</p> : null}
                                <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={creatingCustomer} onClick={createCustomer}>
                                    {creatingCustomer ? <SpinnerGap className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    Create customer
                                </Button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    placeholder="Search customer by name, mobile, or ID..."
                                    value={customerQuery}
                                    onChange={(event) => handleCustomerSearch(event.target.value)}
                                    onFocus={() => customerResults.length > 0 && setShowCustomerDrop(true)}
                                    className="pr-9"
                                />
                                {searchingCustomers
                                    ? <SpinnerGap className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                                    : <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                                }
                                {showCustomerDrop && customerResults.length > 0 ? (
                                    <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                                        {customerResults.map((customer) => (
                                            <button key={customer.id} type="button" className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50" onMouseDown={() => selectCustomer(customer)}>
                                                <span>
                                                    <span className="block text-sm font-medium">{customer.name}</span>
                                                    <span className="block text-xs text-slate-500">{customer.mobile || 'No mobile'}</span>
                                                </span>
                                                <span className="font-mono text-xs text-slate-400">{customer.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                                {showCustomerDrop && !searchingCustomers && customerResults.length === 0 && customerQuery.trim() ? (
                                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white p-3 shadow-lg">
                                        <p className="text-sm text-slate-500">No customer found.</p>
                                        <Button size="sm" variant="outline" className="mt-2" onMouseDown={openCustomerForm}>
                                            <UserPlus className="mr-2 h-4 w-4" /> Add new customer
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                    ) : null}

                    {/* ── Design search (after recipient selected) ── */}
                    {selectedRecipient && (
                        <>
                            <Separator />
                            <div className="space-y-1.5" ref={designRef}>
                                <Label className="text-sm font-medium">Add Design</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Search by design code or name..."
                                        value={designQuery}
                                        onChange={(e) => handleDesignSearch(e.target.value)}
                                        onFocus={() => designResults.length > 0 && setShowDesignDrop(true)}
                                        className="pr-9"
                                    />
                                    {searchingDesigns
                                        ? <SpinnerGap className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                                        : <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                                    }
                                    {showDesignDrop && designResults.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-52 overflow-y-auto">
                                            {designResults.map(p => {
                                                const alreadyAdded = cartItems.some(i => i.product.productId === p.productId)
                                                return (
                                                    <div key={p.productId}
                                                        className={`px-3 py-2.5 flex items-center justify-between ${alreadyAdded ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                                                        onMouseDown={() => !alreadyAdded && addToCart(p)}>
                                                        <div>
                                                            <span className="font-medium text-sm">{p.name}</span>
                                                            <span className="font-mono text-xs text-gray-400 ml-2">{p.design}</span>
                                                        </div>
                                                        <div className="flex gap-3 text-xs">
                                                            <span className="text-violet-600 font-medium">PRM <span className="font-bold">{p.prm ?? 0}</span></span>
                                                            <span className="text-blue-600 font-medium">STD <span className="font-bold">{p.std ?? 0}</span></span>
                                                            {alreadyAdded && <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Added</Badge>}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    {showDesignDrop && !searchingDesigns && designResults.length === 0 && designQuery.trim() && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow p-3 text-sm text-gray-500">
                                            No designs found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Cart items ── */}
                            {cartItems.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Order Items</Label>
                                    <div className="space-y-2">
                                        {cartItems.map(item => {
                                            const availPrm = Number(item.product.prm) || 0
                                            const availStd = Number(item.product.std) || 0
                                            const qty = Number(item.quantity) || 0
                                            const isPrmSplit = item.stockType === 'prm' && qty > availPrm
                                            const splitProduction = qty - availPrm

                                            return (
                                                <Card key={item.product.productId} className={`p-3 ${item.error ? 'border-red-200 bg-red-50' : ''}`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-sm truncate">{item.product.name}</div>
                                                            <div className="font-mono text-xs text-gray-400">{item.product.design}</div>
                                                            <div className="flex gap-3 mt-1 text-xs">
                                                                <span className="text-violet-600">PRM: <b>{availPrm}</b></span>
                                                                <span className="text-blue-600">STD: <b>{availStd}</b></span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Select value={item.stockType}
                                                                onValueChange={v => updateItem(item.product.productId, 'stockType', v)}>
                                                                <SelectTrigger className="w-[72px] h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="prm">PRM</SelectItem>
                                                                    <SelectItem value="std">STD</SelectItem>
                                                                </SelectContent>
                                                            </Select>

                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={item.stockType === 'std' ? availStd : undefined}
                                                                placeholder="Qty"
                                                                value={item.quantity}
                                                                onChange={e => updateItem(item.product.productId, 'quantity', e.target.value)}
                                                                className="w-20 h-8 text-sm"
                                                            />

                                                            <Button size="icon" variant="ghost"
                                                                className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50"
                                                                onClick={() => removeFromCart(item.product.productId)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Error */}
                                                    {item.error && (
                                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                                                            <AlertCircle className="h-3 w-3" /> {item.error}
                                                        </div>
                                                    )}

                                                    {/* PRM split info */}
                                                    {!item.error && isPrmSplit && (
                                                        <div className="flex items-start gap-1 mt-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                                                            <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                                            <span>
                                                                {availPrm > 0
                                                                    ? <><b>{availPrm}</b> from stock + <b>{splitProduction}</b> as production order</>
                                                                    : <><b>{qty}</b> added as production order (no PRM stock available)</>
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Order-level error ── */}
                    {orderError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            <AlertCircle className="h-4 w-4 shrink-0" /> {orderError}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/60">
                    <div className="text-sm text-gray-500">
                        {cartItems.length > 0
                            ? <>{cartItems.length} design{cartItems.length !== 1 ? 's' : ''} · <b>{totalBoxes}</b> box{totalBoxes !== 1 ? 'es' : ''}</>
                            : <span className="text-gray-400">No items added yet</span>
                        }
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={placing}>Cancel</Button>
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={!canPlace}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {placing
                                ? <><SpinnerGap className="mr-1.5 h-4 w-4 animate-spin" />Placing...</>
                                : 'Place Order'
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
