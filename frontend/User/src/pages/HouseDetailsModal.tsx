import React, { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { Star, MapPin, Shield, Clock, Users, CheckCircle } from "lucide-react";
import { Badge } from "../components/ui/Badge";

export const HouseDetailsModal = ({ house, isOpen, onClose }: any) => {
  const [mainImgIdx, setMainImgIdx] = useState(0);
  if (!house) return null;
  const images = house.images || [];
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="animate-fadeIn max-w-6xl w-full flex flex-col justify-center">
        <div className="flex flex-col md:flex-row gap-8 min-h-[480px]" style={{height: 'auto'}}>
          <div className="flex-1 min-w-[320px] max-w-[480px] flex flex-col h-full">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 flex-shrink-0">
              <img src={images[mainImgIdx]} alt={house.title} className="w-full h-full object-cover transition-all duration-300" />
            </div>
            <div className="grid grid-cols-5 gap-6 mb-2 w-full flex-1 items-stretch justify-items-stretch relative mt-12 pb-8">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="flex items-center justify-center w-full h-full relative group">
                  <img
                    src={img}
                    alt=""
                    className={`w-full h-16 object-cover rounded border border-muted cursor-pointer transition-all duration-200 ${mainImgIdx === idx ? 'ring-2 ring-primary' : ''} group-hover:scale-150 group-hover:z-50 group-hover:shadow-2xl`}
                    style={{ zIndex: mainImgIdx === idx ? 20 : 1, position: 'relative' }}
                    onClick={() => setMainImgIdx(idx)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[320px] max-w-[480px] space-y-2 flex flex-col h-full justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {house.title}
              {house.verification.verified && <Shield className="h-4 w-4 text-blue-500" />}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{house.location.estate}, {house.location.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{house.rating.toFixed(1)}</span>
              <span className="text-xs">({house.reviews.length} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary text-lg">KSh {house.price.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {house.amenities.filter((a: any) => a.available).map((a: any) => (
                <span key={a.name} className="px-2 py-1 rounded bg-secondary text-xs">
                  {a.name}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Landlord</h3>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{house.landlord.name}</span>
                <Badge variant="outline" className="ml-2">{house.landlord.phone}</Badge>
                {house.landlord.email && <Badge variant="outline" className="ml-2">{house.landlord.email}</Badge>}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Reviews</h3>
              {house.reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                  {house.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-2 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.userName}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                          <Clock className="h-3 w-3" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs mt-1">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
